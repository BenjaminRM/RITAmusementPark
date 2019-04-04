const { requiresLogin, requiresAdmin, requiresVisitor } = require('./middlewares/authorization')
const admin = require('../app/admin')
const user = require('../app/user')
const ExpressBrute = require('express-brute')

module.exports = (app, passport, db) => {
	var store = new ExpressBrute.MemoryStore();
	var bruteforce = new ExpressBrute(store);

	//Global, no login required
	app.get('/', user.renderhomepage)
	app.get('/home', user.renderhomepage)
	app.get('/login', user.renderlogin)
	app.get('/signup', user.rendersignup)
	app.get('/resetpassword', user.renderreset)

	//Users Actions
	app.post('/api/userlogin', bruteforce.prevent, passport.authenticate('local', { failureRedirect: '/login' }), user.login)
	app.post('/api/logout', requiresLogin, db.auditLog_Loggout)
	app.post('/api/userRegistration', db.userRegistration)

	//Requires basic user login
	app.get('/dashboard', requiresLogin, user.renderdashboard)
	app.get('/dashboard/News', requiresLogin, user.renderdashboard)

	app.get('/dashboard/AuditLogs', requiresLogin, requiresAdmin, db.getAuditLogs)

	app.get('/dashboard/Settings', requiresLogin, db.getDashboardSettings)
	app.post('/dashboard/Settings/Save', requiresLogin, db.setDashboardSettings)

	app.get('/dashboard/Options', requiresLogin, db.getDashboardOptions)
	app.post('/dashboard/Options/Save', requiresLogin, db.setDashboardOptions)
	app.post('/dashboard/Options/DeleteAccount', requiresLogin, db.deleteAccount)
	app.post('/dashboard/Options/RemovePaymentOptions', requiresLogin, db.removePaymentOptions)
	app.post('/dashboard/Options/GDPRReport', requiresLogin, db.generateGDPRReport)

	app.get('/dashboard/PaymentInfo', requiresLogin, db.getPaymentInfo)
	app.post('/dashboard/PaymentInfo/Save', requiresLogin, db.setPaymentInfo)

	// app.get('/dashboard/Shop', requiresVisitor, )

	//Admin Loggin in / out

	//Requires Admin login


	// app.post('/api/visitorlogin', passport.authenticate('local'), visitor.login)
	// app.get('/api/visitorlogout', visitor.logout)
	
	// app.get('/admin/login', admin.renderLogin)
	// app.post('/admin/login', passport.authenticate('local', { failureRedirect: '/admin/login' }), admin.login)
	// app.get('/admin/panel', requiresAdmin, admin.renderPanel)

	app.use(function (err, req, res, next) {
		if (err.message && (~err.message.indexOf('not found'))) {
			return next()
		}

		return res.status(500).json({error: 'Error on backend occurred. ' + err.message})
	})

	app.use(function (req, res) {
		const payload = {
			url: req.originalUrl,
			error: 'Not found'
		}
		if (req.accepts('json')) return res.status(404).json(payload)

		res.status(404).render('404', payload)
	})
}