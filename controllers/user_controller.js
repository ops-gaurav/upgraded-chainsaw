/**
 * Controller for users
 * @author Gaurav Sharma
 * @description contains controller middle-wares for user routes
 */

import fs from 'fs';
import jwt from 'jsonwebtoken';
import ImageMiddleware from '../services/image_middleware';
import response from '../utility/response_generator';
import UserModel from '../models/user_model';

var exports = module.exports = {};

/**
 * send all users
 */
exports.allUsers = function (req, res, next) {
    UserModel.allUsers ((err, doc) => {
        if (err) {
            res.send (response.error (err));
        } else if (doc) {
            res.send (response.success (doc));
        } else {
            res.send (response.error ('No data'));
        }
    });
};

/**
 * this middleware would be called only if passport authenticated,
 * hence returns the user info
 */
exports.sessionInfo = function (req, res, next) {
    res.send (response.success (req.user));
}

/**
 * logout the current session
 */
exports.logout = function (req, res, next) {
    req.logout();
    res.end ();
}

/**
 * login a user
 * accepts Username and password
 * returns Token if authenticated
 */
exports.loginAuthenticate = (req, res, next) => {
    if (req.body.username && req.body.password) {
		UserModel.getByUsername (req.body.username, (err, doc) => {
			if (err) {
				res.send (response.error (err));
			} else if (doc) {
				// there is some data
				if (doc.password == req.body.password) {
					// serialize this information 
					var payload = {
						id: doc._id,
						username: doc.username,
						email: doc.email,
						phone: doc.phone,
						type: doc.type,
						image: doc.image
					};

					let token = jwt.sign (payload, 'winteriscoming');
					res.send (response.success (token));
				} else {
					res.send (response.error ('Password did not match'));
				}
			} else {
				res.send (response.error ('No data'));
			}
		});
	} else {
		res.send (response.error ('Required username and password'));
	}
}

/**
 * authenticate using the middleware like passport
 * pass the authentication middleware in routes
 */
exports.authenticate = function (req, res, next) {
    res.send (response.success (req.user));
}

/**
 * middleware controller to create a new user
 * @param {object} data passed as JSON in request
 */
exports.createUser = function (req, res, next) {
    let data = req.body;
    console.log (data);
    if (data.username && data.password && data.phone && data.email && data.type) {

		UserModel.saveUser (data, (err, data) => {
			if (err) {
                res.send (response.error (err));
            }
			else if (data) {
				if (data.status == 'success') {
                    res.send (response.success (data.message))
                }
				else {
                    res.send (response.error (data.message));
                } 
            }
		});
	} else  res.send (response.error ('incomplete data'));
}

/**
 * find user by it's username. This middleware would be 
 * used by the routes that are run by signup forms to validate
 * the new usernames
 * @param {string} username passed as params
 */
exports.findByUsername = function (req, res, next) {
    UserModel.getByUsername (req.params.username, (err, data) => {
        if (err) {
            res.send (response.error (err));
        }
        else if (data) {
            res.send (response.success ('username found'));
        }
        else {
            res.send (response.error ('username not found'));
        }
    });
};

/**
 * update a user.
 * @param {string} id passed as params
 * @param {Object} body passed as json in req.body
 */

exports.updateUser = function (req, res, next) {
    var data = req.body;
	if (data.username && data.password && data.phone && data.email && data.type) {
        UserModel.update (data, (err, data) => {
            if (err) res.send (response.error (err));
            else if (data) 
                // data is only sent when success
                res.send (response.success('updated'));
            else res.send (response.error ('No data'));
        });
	} else res.send (response.error ('Data incomplete'));
};

/**
 * delete an existing user. Only admin can call this API
 * @param {string} id passes as params
 */
exports.deleteUser = function (req, res, next) {
    if (req.user.doc.type === 'admin') {
        UserModel.delete (req.params.id, (err, data) => {
            if (err) {
                res.send (response.error (err));
            } else {
                res.send (response.success ('deleted'));
            }
        })
    } else {
        res.send (response.error ('Unauthorized access'));
    }
};

/**
 * middleware to add a product image
 * @param {object} image as req.image multipart form data
 */
exports.addUserImage = (req, res, next) => {
    ImageMiddleware (req, res, (err) => {
        if (err) res.send (response.error('error uploading: '+ err));
        else {
			//   save the image properties in database
			 var imageProperties = {
				 mimeType: req.image.mimetype,
				 username: req.user.doc.username
			 };
			 UserModel.persistImageProperties (req.params.id, imageProperties, (err, doc) => {
				 if (err) res.send (response.error (err));
				 else if (doc) res.send (response.success ('image uploaded'));
				 else res.send (response.error ('Data not found'));
			 });
        }
    });
}

// get the image of the user
exports.getUserImage = (req, res, next) => {
    var image = undefined;
    // var image = fs.readFileSync (__dirname +'/../tempUploads/'+ req.params.id);
    // res.contentType (req.params.mime.replace ('-', '/'));
    try {
        image = fs.readFileSync (__dirname +'/../tempUploads/'+ req.params.id);
        res.contentType (req.params.mime.replace ('-', '/'));
    } catch (e) {
        if (e.code === 'ENOENT') {
            image = fs.readFileSync (__dirname + '../public/images/profile.png');
            res.contentType ('image/png');
        }
    }
    res.end (image, 'binary');
}
