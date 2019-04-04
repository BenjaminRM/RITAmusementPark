//DO NOT REFERENCE THIS FILE! IT IS ONLY FOR REFERENCE, AND HOLDING CODE EXAMPLES!
//... mostly because Ben doesn't want to look things up all the time :)

//Connecting to our database using environment variables (These need to be changed in the 
//EB environment -> Config -> Software tile to be limited to just read / write access to the DB,
//and no drop/modify access)
//+ How to perform a query - also found here: https://node-postgres.com/features/queries
var pg = require('pg');

var connection = new pg.Client({
    user: process.env.RDS_USERNAME,
    host: process.env.RDS_HOSTNAME,
    database: process.env.RDS_DB_NAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
});
connection.connect(function(err) {
    if(err) {
        log('Could not connect to PostgreSQL: ' + err);
    }
    else {
        log('Successfully connected to the database!');

        connection.query("SELECT * FROM users", (err, res) => {
            if(res) {
                //do something
            }
            if(err) {
                //do something else, probably log & return an error msg
            }
            connection.end()
        });
    }
});

//Building and using a log
//These log entries will be found when you download all logs (from EB console via web)
//Download the full logs -> tmp -> check your log file
//TODO Make this a separate .js file and require() it everywhere necessary
//This MAY be how we handle audit logs
var fs = require('fs');

var log = function(entry) {
    fs.appendFileSync('/tmp/LOGNAME.log', new Date().toISOString() + ' - ' + entry + '\n');
};
log("QUERY ERRORS: " + err);

