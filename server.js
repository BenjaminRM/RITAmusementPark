const express = require('express');
const passport = require('passport');
const db = require('./db');

var port = process.env.PORT || 3000;
const app = express()

//Tells the app it can use "static resources" found in the 'public' directory
app.use(express.static(__dirname + '/public'));

require('./config/passport')(passport, db);
require('./config/express')(app, passport)
require('./config/routes')(app, passport, db)

const server = app.listen(port, () => {
    //TODO add audit log to state the server is listening on this port
});

server.on('close', () => {
    //TODO add audit log for server shutting down / closing

    db.pool.end(() => {
        //TODO add audit log to show closure for the db pool
    });
});