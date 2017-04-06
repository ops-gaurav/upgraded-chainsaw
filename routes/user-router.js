import express from 'express';
import UserModel from '../models/user_model';
import config from '../data/config';
import fs from 'fs';
import passport from '../middlewares/passport_auth';
import MulterMiddleware from'../middlewares/multer_middleware'
import response from '../utility/response_generator';

let User = UserModel.user;

let router = express.Router();

function sRes (message) {
	return {status: 'success', message: message};
}
function eRes (message) {
	return {status: 'error', message: message};
}

router.get ('/all', (req, res) => {
	if (req.isAuthenticated ()) {
		UserModel.allUsers ( (err, doc) => {
			if (err) res.send (response.error (err));
			else if (doc && doc.length > 0)
				res.send (response.success (doc));
			else res.send (reponse.error ('no data found'));
		});
	}
});

router.get ('/sessioninfo', (req, res) => {
	if (req.isAuthenticated()) 
		res.send (response.success (req.user));
	else
		res.send (response.error ('User not authenticated'));
});

router.get ('/logout', (req, res) => {
	req.logout();
	res.end ();
});
router.post ('/auth', passport.authenticate ('PasswordAuth', {
	failureFlash : 'error authenticating',
	successFlash : 'success authenticating'
}), (req, res) => {
	res.send (sRes(req.user));
})

/**
 *  create a new user
 */
router.post ('/signup', (req, res) => {
    let data = req.body;
    console.log (data);
    if (data.username && data.password && data.phone && data.email && data.type) {

		UserModel.saveUser (data, (err, data) => {
			if (err) res.send (response.error (err));
			else if (data) 
				if (data.status == 'success') res.send (response.success (data.message))
				else res.send (response.error (data.message));
		});
	} else  res.send (response.error ('incomplete data'));

});

router.get ('/usernameLookup/:username', (req, res) => {
	if (req.params.username) {
		UserModel.getByUsername (req.params.username, (err, data) => {
			if (err) res.send (response.error (err));
			else if (data) res.send (response.success ('username found'));
			else res.send (response.error ('username not found'));
		});
	}
	else res.send (eRes ('no username provided'));
})

/**
 * WORKING
 */
router.put ('/update/:id', (req, res) => {
	var data = req.body;
	if (data.username && data.password && data.phone && data.email && data.type) {
		if (req.params.id) {
			UserModel.update (data, (err, data) => {
				if (err) res.send (response.error (err));
				else if (data) 
					// data is only sent when success
					res.send (response.success('updated'));
				else res.send (response.error ('No data'));
			});
		} else res.send (eRes ('no id provided'));
	} else res.send (eRes ('Data incomplete'));
});

/**
 * delete the existing user
 */
router.delete ('/delete/:id', (req, res) => {
	if (req.isAuthenticated()) {
		if (req.user.doc.type == 'admin') {
			if (req.params.id) {
				UserModel.delete(req.params.id, (error, data) => {
					if (err) res.send (response.error (err));
					else res.send (response.success('deleted'));
				});
			} else res.send (response.error ('Id not sent'));
		} else res.send (response.error ('You need to be admin'));
	} else res.send (response.error ('login first'));
});

/**
 * route to add image
 */
router.put ('/addImage/:id', (req, res) => {
	MulterMiddleware (req, res, (err) => {
        if (err) res.send (response.error('error uploading: '+ err));
        else {
			/**
			 * save the image properties in database
			 */
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
});

router.get ('/image/:id/:mime', (req, res) => {
	res.contentType (req.params.mime.replace ('-', '/'));
    var image = fs.readFileSync (__dirname +'/../tempUploads/'+ req.params.id);
    res.end (image, 'binary');
})

module.exports = router;