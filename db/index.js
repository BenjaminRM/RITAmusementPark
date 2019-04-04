const pg = require('pg')
const user = require('../app/user')
const bcrypt = require('bcrypt-nodejs');

const dbConfig = {
    user: process.env.RDS_USERNAME,
    host: process.env.RDS_HOSTNAME,
    database: process.env.RDS_DB_NAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT
};

const pool = new pg.Pool(dbConfig);
pool.on('error', function(err) {
    
});

function auditLog (message) {
    var now = new Date();
    pool.query('INSERT INTO audit_logs(datetime, comment) VALUES($1, $2) RETURNING *', [now, message], (err, result) => {
        if(err) {
            console.error("ERROR FOUND: Failure to INSERT an Audit Log: ", err);
        }
        else {
            console.log("New Audit Log record created: ", result.rows[0]);
        }
    });
}

module.exports = {
    pool,
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    },
    userRegistration: (req, res) => {
        var email = req.body.email
        var password = req.body.password

        pool.query('SELECT email FROM login_info WHERE email=$1 LIMIT 1', [email], (err, result) => {
            if(err) {
                console.error("ERROR FOUND: ", err);
            }
            if(result.rows.length > 0) {
                auditLog("FAILURE: [Registration] Collision by email. Existing email: " +
                    result.rows[0].email + " Attempted email: " + email)
                res.redirect("/signup")
            }
            else if(password.length < 8){
                auditLog("FAILURE: Password length less than 8 characters.")
                res.redirect("/signup")
            }
            else if(!(/[a-z]/.test(password))){
                auditLog("FAILURE: Password needs to contain at least one lowercase letter.")
                res.redirect("/signup")
            }
            else if(!(/[A-Z]/.test(password))){
                auditLog("FAILURE: Password needs to contain at least one uppercase letter.")
                res.redirect("/signup")
            }
            else if(!(/[1-9]/.test(password))){
                auditLog("FAILURE: Password needs to contain at least one number.")
                res.redirect("/signup")
            }
            else if(!(/[!”#$%&'()*+,-./:;<=>?@[\]^_`{|}~]/.test(password))){
                auditLog("FAILURE: Password needs to contain at least one special character.")
                res.redirect("/signup")
            }
            else {
                var hash = bcrypt.hashSync(password);
                pool.query('INSERT INTO login_info(email, password, type) VALUES($1, $2, $3) RETURNING *', [email, hash, "Visitor"], (err, result) => {
                    if(err) {
                        console.error("ERROR FOUND: ", err);
                    }
                    else {
                        auditLog("SUCCESS: [Registration] New login_info created with the following id: " + result.rows[0].login_id)

                        var login_info_id = result.rows[0].login_id
                        var credit_id = null
                        var history_id = null

                        //For this new user - create a Credit, History, and finally the visitor record(s)
                        //Credit record
                        pool.query('INSERT INTO financial_info(billing_address) VALUES($1) RETURNING *', [null], (err, creditResult) => {
                            if(err) {
                                console.error("ERROR FOUND: ", err);
                            }
                            else {
                                // console.log("Resulting financial info record: ", creditResult.rows[0]);
                                auditLog("SUCCESS: [Registration] New Financial_Info created with the following id: " + creditResult.rows[0].credit_id + " Related to user (id): " + login_info_id)
                                credit_id = creditResult.rows[0].credit_id

                                 //History Record
                                pool.query('INSERT INTO history_recs(item_bought) VALUES($1) RETURNING *', [null], (err, historyResult) => {
                                    if(err) {
                                        console.error("ERROR FOUND: ", err);
                                    }
                                    else {
                                        // console.log("Resulting history recs record: ", historyResult.rows[0]);
                                        auditLog("SUCCESS: [Registration] New History_recs created with the following id: " + historyResult.rows[0].history_id + " Related to user (id): " + login_info_id)
                                        history_id = historyResult.rows[0].history_id

                                        //Visitor Record
                                        pool.query('INSERT INTO visitor(login_id, credit_id, history_id) VALUES($1, $2, $3) RETURNING *', [login_info_id, credit_id, history_id], (err, visitorResult) => {
                                            if(err) {
                                                console.error("ERROR FOUND: ", err);
                                            }
                                            else {
                                                // console.log("Resulting Visitor record: ", visitorResult.rows[0]);
                                                auditLog("SUCCESS: [Registration] New Visitor created with the following id: " + visitorResult.rows[0].visitor_id + " Related to user (id): " + login_info_id)
                                            }
                                        });
                                    }
                                });
                            }
                        });

                       

                        //Render the login page with a message
                        user.renderlogin_message(req, res, "Account Successfully Created - Please Log In.")
                    }
                });
            }
        });
    },
    auditLog : (message) => {
        var now = new Date();
        pool.query('INSERT INTO audit_logs(datetime, comment) VALUES($1, $2) RETURNING *', [now, message], (err, result) => {
            if(err) {
                console.error("ERROR FOUND: ", err);
            }
            else {
                console.log("New Audit Log record created: ", result.rows[0]);
            }
        });
    },
    auditLog_Loggout : (req, res, next) => {
        var now = new Date();
        var message = "SUCCESS: User Logged out (id): " + req.user.login_id
        pool.query('INSERT INTO audit_logs(datetime, comment) VALUES($1, $2) RETURNING *', [now, message], (err, result) => {
            if(err) {
                console.error("ERROR FOUND: ", err);
            }
            else {
                console.log("New Audit Log record created: ", result.rows[0]);
            }
        });

        user.logout(req, res, next)
    },
    getDashboardSettings : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do a query for all settings information
            pool.query('SELECT name, date_of_birth, gender, address, city, state, zip, phone_number FROM visitor WHERE login_id=$1 LIMIT 1', [req.user.login_id], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                if(result.rows.length > 0) {
                    auditLog("SUCCESS: [User Settings] User: " + req.user.login_id + " Queried for user settings.");
                    // console.log(result.rows[0])
                    user.renderdashboard_settings(req, res, result.rows[0])
                }
            });
        }
        else{
            //additional stuff
        }
    },
    setDashboardSettings : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do an insertion query to save all user settings
            pool.query('UPDATE visitor SET name=$2, date_of_birth=$3, gender=$4, address=$5, city=$6, state=$7, zip=$8, phone_number=$9 WHERE login_id=$1', 
                        [req.user.login_id, req.body.name, req.body.dob, req.body.gender, req.body.address, req.body.city, req.body.state, req.body.zip, req.body.phone], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                else {
                    auditLog("SUCCESS: [User Settings] User: " + req.user.login_id + " Saved user settings. (Update to visitor record)");
                }
            });

            //If email address was changed, also update that record
            if(req.body.email != req.user.email) {
                pool.query('UPDATE login_info SET email=$2 WHERE login_id=$1', [req.user.login_id, req.body.email], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                else {
                    auditLog("SUCCESS: [User Settings] User: " + req.user.login_id + " Saved user settings [EMAIL UDPATE]. (Update to login_info record)");
                }
            });
            }

            res.redirect('/dashboard');

        }
        else{
            //additional stuff
        }
    },
    getDashboardOptions : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do a query for all settings information
            pool.query('SELECT collect_ride_data, allow_for_analysis FROM visitor WHERE login_id=$1 LIMIT 1', [req.user.login_id], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                if(result.rows.length > 0) {
                    auditLog("SUCCESS: [User Options] User: " + req.user.login_id + " Queried for user options.");
                    user.renderdashboard_options(req, res, result.rows[0])
                }
            });
        }
    },
    setDashboardOptions : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do an insertion query to save all user settings
            var collect_ride_data = "";
            var allow_for_analysis = "";
            if(req.body.collect_ride_data == "on") { collect_ride_data = "checked"; }
            if(req.body.allow_for_analysis == "on") { allow_for_analysis = "checked"; }

            pool.query('UPDATE visitor SET collect_ride_data=$2, allow_for_analysis=$3 WHERE login_id=$1', [req.user.login_id, collect_ride_data, allow_for_analysis], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                else {
                    auditLog("SUCCESS: [User Options] User: " + req.user.login_id + " Saved user options. (Update to visitor record)");
                }
            });

            res.redirect('/dashboard');
        }
    },
    getPaymentInfo : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do a query for all payment information
            pool.query('SELECT address, city, state, zip, credit_id FROM visitor WHERE login_id=$1 LIMIT 1', [req.user.login_id], (err, visitorResult) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                if(visitorResult.rows.length > 0) {
                    auditLog("SUCCESS: [User Payment Information] User: " + req.user.login_id + " Queried for credit_id FROM the visitor table: " + visitorResult.rows[0].credit_id);

                    pool.query('SELECT billing_address, billing_city, billing_state, billing_zip, credit_card_number, credit_card_expiration, credit_card_cvc FROM financial_info WHERE credit_id=$1 LIMIT 1',
                                [visitorResult.rows[0].credit_id], (err, financialResult) => {
                        if(err) {
                            console.error("ERROR FOUND: ", err);
                        }
                        if(financialResult.rows.length > 0) {
                            auditLog("SUCCESS: [User Payment Information] User: " + req.user.login_id + " Queried for Credit information.");

                            //Since the front end form is required on all address information, any submission will have all address information from here on out
                            if(financialResult.rows[0].billing_address === null || financialResult.rows[0].billing_address === undefined ) {
                                var data = {
                                    billing_address : visitorResult.rows[0].address,
                                    billing_state : visitorResult.rows[0].state,
                                    billing_city : visitorResult.rows[0].city,
                                    billing_zip : visitorResult.rows[0].zip,
                                    credit_card_number : financialResult.rows[0].credit_card_number,
                                    credit_card_expiration : financialResult.rows[0].credit_card_expiration,
                                    credit_card_cvc : financialResult.rows[0].credit_card_cvc
                                }
                                user.renderdashboard_payment(req, res, data)
                            }
                            else {
                                user.renderdashboard_payment(req, res, financialResult.rows[0])
                            }
                            
                        }
                    });
                }
            });
        }
    },
    setPaymentInfo : (req, res, next) => {
        if(req.user.type == "Visitor") {
            //Do a query to get the credit id from the user's visitor record relation
            pool.query('SELECT credit_id FROM visitor WHERE login_id=$1 LIMIT 1', [req.user.login_id], (err, result) => {
                if(err) {
                    console.error("ERROR FOUND: ", err);
                }
                if(result.rows.length > 0) {
                    //Do an insertion query to save all payment information
                    pool.query('UPDATE financial_info SET billing_address=$2, billing_city=$3, billing_state=$4, billing_zip=$5, credit_card_number=$6,' 
                    + ' credit_card_expiration=$7, credit_card_cvc=$8 WHERE credit_id=$1', [result.rows[0].credit_id, req.body.billing_address, req.body.billing_city, req.body.billing_state,
                    req.body.billing_zip, req.body.credit_card_number, req.body.credit_card_expiration, req.body.credit_card_cvc], (err, updateResult) => {
                    if(err) {
                        console.error("ERROR FOUND: ", err);
                    }
                    else {
                        auditLog("SUCCESS: [User Payment Information] User: " + req.user.login_id + " Saved user payment information. (Update to financial information record): " + result.rows[0].credit_id);

                        res.redirect('/dashboard');
                    }
                });
                }
            });
        }
    },
    getAuditLogs : (req, res, next) => {
        //Do a query for all settings information
        pool.query('SELECT datetime, comment FROM audit_logs ORDER BY datetime DESC', (err, result) => {
            if(err) {
                console.error("ERROR FOUND: ", err);
            }
            if(result.rows.length > 0) {
                auditLog("SUCCESS: [Admin Audit Logs] User: " + req.user.login_id + " Queried for all Audit Logs.");
                user.renderdashboard_auditlogs(req, res, result.rows)
            }
        });
    },
    deleteAccount : (req, res, next) => {
        // TODO
        res.redirect('/dashboard');
    },
    removePaymentOptions : (req, res, next) => {
        // TODO
        res.redirect('/dashboard');
    },
    generateGDPRReport : (req, res, next) => {
        // TODO
        res.redirect('/dashboard');
    }
};