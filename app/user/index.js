module.exports = {

    login: (req, res) => {
        res.redirect('/dashboard');
    },

    logout: (req, res, next) => {
		req.session.destroy((err) => {
			if(err) return next(err)

			req.logout()

            res.redirect('/home');
		})
    },
    
	renderhomepage: (req, res) => {
        var loggedIn = false;
        if (req.user != undefined) {
            loggedIn = true;
        }

        res.render('home', {
            pageTitle: 'Home | RIT Amusement Park',
            loggedIn: loggedIn
        });
    },

    renderlogin: (req, res) => {
        res.render('login', {
            layout: false,
            pageTitle: 'Login | RIT Amusement Park'
        });
    },

    renderlogin_message: (req, res, _message) => {
        res.render('login', {
            layout: false,
            pageTitle: 'Login | RIT Amusement Park',
            message: _message
        });
    },

    rendersignup: (req, res) => {
        res.render('signup', {
            layout: false,
            pageTitle: 'Signup | RIT Amusement Park'
        });
    },

    renderreset: (req, res) => {
        res.render('resetpassword', {
            layout: false,
            pageTitle: 'Reset Password | RIT Amusement Park'
        });
    },

    renderdashboard: (req, res) => {
        var type = req.user.type;

        if(type == "Visitor") {
            res.render('visitorDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Dashboard | RIT Amusement Park',
                user: req.user,
                News: true
            });
        }
        else if(type == "Admin") {
            res.render('adminDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Dashboard | RIT Amusement Park',
                user: req.user,
                News: true
            });
        }
        
    },

    renderdashboard_settings: (req, res, _data) => {
        var type = req.user.type;

        if(type == "Visitor") {
            res.render('visitorDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Settings | RIT Amusement Park',
                user: req.user,
                Settings: true,
                data: _data
            });
        }
        else if(type == "Admin") {
            res.render('adminDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Settings | RIT Amusement Park',
                user: req.user,
                Settings: true,
                data : _data
            });
        }
    },

    renderdashboard_options: (req, res, _data) => {
        var type = req.user.type;

        if(type == "Visitor") {
            res.render('visitorDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Options | RIT Amusement Park',
                user: req.user,
                Options: true,
                data: _data
            });
        }
    },

    renderdashboard_payment: (req, res, _data) => {
        var type = req.user.type;

        if(type == "Visitor") {
            res.render('visitorDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Payment Information | RIT Amusement Park',
                user: req.user,
                Payment: true,
                data: _data
            });
        }
    },

    renderdashboard_auditlogs: (req, res, _data) => {
        var type = req.user.type;

        if(type == "Admin") {
            res.render('adminDashboard', {
                layout: 'dashboard.handlebars',
                pageTitle: 'Settings | RIT Amusement Park',
                user: req.user,
                AuditLogs: true,
                data : _data
            });
        }
    },
}