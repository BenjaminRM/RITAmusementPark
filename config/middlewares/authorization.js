module.exports = {
	requiresLogin: (req, res, next) => {
		if (req.user) return next()

		res.sendStatus(401)
	},

	requiresAdmin: (req, res, next) => {
		if (req.user && req.user.type === 'Admin') return next()

		res.sendStatus(401)
	},

	requiresVisitor: (req, res, next) => {
		if (req.user && req.user.type === 'Visitor') return next()

		res.sendStatus(401)
	}
}