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
    console.log("Server running and listening on port: " + port);
});

server.on('close', () => {
    console.log("Server closing...");
    db.pool.end(() => {
        console.log("Database Connection Pool closing...");
    });
});