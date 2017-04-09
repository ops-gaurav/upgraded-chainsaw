/**
 * @description the middleware controller to authenticate requests
 * @author Gaurav Sharma
 */

import response from '../utility/response_generator';

var exports = module.exports = {};

/**
 * authenticate for user session
 */
exports.userAuthenticated = (req, res, next) => {
    if (req.isAuthenticated ()){
        next();
    }
    else {
        res.send (response.error('Login first'));
    }
}

/**
 * authenticate request for admin only
 */
exports.adminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated())  {
        if (req.user.doc.type === 'admin') {
            next();
        } else {
            res.send (response.error ('Unauthorized access'))
        }
    } else {
        res.send (response.error ('Login first'));
    }
}