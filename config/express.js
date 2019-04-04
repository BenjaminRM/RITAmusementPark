const path = require('path')
const bodyParser = require('body-parser')
const express = require('express')
const session = require('express-session')
const expressHandlebars = require('express-handlebars')
const cookieParser = require('cookie-parser')

module.exports = (app, passport) => {

    //Check out more about handlebars here: https://github.com/ericf/express-handlebars
    app.engine('handlebars', expressHandlebars({defaultLayout: 'main'}))
	app.set('views', path.join(__dirname, '../views'))
	app.set('view engine', 'handlebars')

    //More about the body parse here: https://github.com/expressjs/body-parser
	app.use(bodyParser.json())
    app.use(bodyParser.urlencoded({ extended: true }))
    
    app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

    //More about the cookie parser here: https://github.com/expressjs/cookie-parser
	app.use(cookieParser())

    //Some more about passport here: https://github.com/jaredhanson/passport
    //                          and: https://github.com/jaredhanson/passport-local
    app.use(passport.initialize());
    app.use(passport.session());
};
