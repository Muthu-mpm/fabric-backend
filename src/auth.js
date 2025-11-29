/**
 * @module Route_js
 */
 /**
 * @function
 * @author Muthu G & Balaji K
 * @name ensureAuthenticated
 * @description It will ensure Authentication
 */
module.exports = {
    ensureAuthenticated: function (req, res, next) {
        if (req.isAuthenticated()) {
            return next();
        }
        res.redirect('/');
    }
}
