const userModel = require('../model/users')

function userLoggedMiddleware(req, res, next) {
    res.locals.userLogged = false;
    let emailInCookie = req.cookies.userEmail
    let userFromCookie = userModel.fineByField('email', emailInCookie)
    if (userFromCookie) {
        req.session.userLogged = userFromCookie
    }
    if (req.session.userLogged) {
        res.locals.userLogged = req.session.userLogged
    }
    next();
}
module.exports = userLoggedMiddleware