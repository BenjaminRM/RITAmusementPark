const bcrypt = require('bcrypt-nodejs');
const LocalStrategy = require('passport-local').Strategy;

module.exports = (passport, db) => {
    passport.use(new LocalStrategy((email, password, callback) => {
        db.query('SELECT login_id, email, type, password FROM login_info WHERE email=$1 LIMIT 1', [email], (err, result) => {
            if(err) {
                //TODO log a database failure
                callback(err);
                console.error("ERROR FOUND: ", err);
            }

            //If a user was found with that email, compare their passwords
            if(result.rows.length > 0) {
                const first = result.rows[0]
                //TODO fix this
                bcrypt.compare(password, first.password, function(err, res) {
                    if(res) {
                        callback(null, {login_id: first.login_id});
                        db.auditLog("SUCCESS: User Logged in (id): " + first.login_id)
                        console.error("PASSWORD MATCHED");
                    }
                    else {
                        //Password doesn't match
                        callback(null, false);
                        console.error("PASSWORD DIDN'T MATCH");
                        db.auditLog("FAILED: User Loggin (attempted email): " + email + ". Password did not match.")
                    }
                });
            }
            //No user found with this email
            else {
                callback(null, false);
                console.error("NO USER BY THIS EMAIL");
                db.auditLog("FAILED: User Loggin (attempted email): " + email + ". User does not exist.")
            }
        });
    }));

    //These next two serialize and deserialize user functions are for holding user information in cookies
    passport.serializeUser((user, done) => {
        done(null, user.login_id);
    });

    passport.deserializeUser((id, callback) => {
        db.query('SELECT login_id, email, type FROM login_info WHERE login_id = $1 LIMIT 1', [parseInt(id, 10)], (err, results) => {
            if(err) {
                //TODO log error when selecting user on session deserialize
                return callback(err);
            }

            callback(null, results.rows[0]);
        });
    });
};