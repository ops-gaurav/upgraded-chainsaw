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
			else if (doc) res.send (response.success ('username found'));
			else res.send (response.error ('username not found'));
		});
	}
	else res.send (eRes ('no username provided'));
})

router.put ('/update/:id', (req, res) => {
	var data = req.body;
	if (data.username && data.password && data.phone && 
		data.email && data.type) {

		if (req.params.id) {
			User.findOne ({_id: req.params.id}, (err, doc) => {
				if (err) res.send (eRes ('Server error: '+ err))
				else if (doc) {
					doc.username = data.username;
					doc.password = data.password;
					doc.phone = data.phone;
					doc.email = data.email;
					doc.type = data.type;

					doc.save (). then (() => {
						// mongoose.disconnect ();
						// UPDATE PASSORT SESSION VALUE HERE
						req.login (doc, err => {
							if (err) res.send (eRes ('Error loagging in'));
							else res.send (sRes ('updated'));
						});
					});
				} else res.send (eRes ('No user found'));
			})
		} else res.send (eRes ('no id provided'));
	} else res.send (eRes ('Data incomplete'));
});

router.delete ('/delete/:id', (req, res) => {
	if (req.isAuthenticated()) {
		if (req.user.doc.type == 'admin') {
			if (req.params.id) {
				// mongoose.Promise = es6Promise;
				// mongoose.connect (config.host, config.db);

				User.remove ({_id: req.params.id}, (err) => {
					if (err) res.send (eRes ('error deleting: '+ err));
					else res.send (sRes ('deleted'));

					// mongoose.disconnect ();
				});
			} else res.send (eRes ('Id not sent'));
		} else res.send (eRes ('You need to be admin'));
	} else res.send (eRes ('login first'));
});

router.put ('/addImage/:id', (req, res) => {
	MulterMiddleware (req, res, (err) => {
        if (err) res.send ({status: 'error', message: 'error uploading: '+ err});
        else {

            User.findOne ({_id: req.params.id}, (err, data) => {
                if (err) {
					res.send ({status: 'error', message: 'Error: '+ err});
                } else if (data) {
                    data.image = {
                        mime: req.image.mimetype.replace ('/', '-'),
                        value: req.user.doc.username +'_avatar'
                    }

                    data.save (). then (() => {
                        res.send ({status: 'success', data: data});
                    });
                } else { 
					res.send ({status: 'error', message: 'no data'});
				}
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