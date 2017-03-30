import express from 'express';
import passport from 'passport';
import mongoose from 'mongoose';
import LocalStrategy from 'passport-local';

import User from '../models/user_model';

import config from '../data/config';

var router = express.Router();
var es6Promise = require ('es6-promise').Promise;

passport.use ('PasswordAuth', new LocalStrategy ( {
	usernameField: 'username',
	passwordField: 'password'
},( username, password, done) => {

	mongoose.Promise = es6Promise;
	mongoose.connect (config.host, config.db);

	User.findOne ({username: username}, (err, doc) => {
		if (err) done (err);
		else if (doc) 
			if (doc.password == password) 
				if (doc.type == 'admin') {
					var newData = {
						redirect: '/admin',
						doc: doc
					}
					//doc.redirect = '/adminDashboard';
					done (null, newData);
				}
				else {
					var newData = {
						redirect: '/user',
						doc: doc
					}
					doc.redirect = '/user';
					done (null, newData);
				}
			else
				done (null, false, { failureFlash: 'incorrect password' });
		else
			done (null, false, { failureFlash: 'Username error' });
	
		mongoose.disconnect ();
	});
}));

passport.serializeUser ((user, done) => {
    return done (null, user);
});
passport.deserializeUser ((user, done) => {
    done (null, user);
});

function sRes (message) {
	return {status: 'success', message: message};
}
function eRes (message) {
	return {status: 'error', message: message};
}

router.get ('/all', (req, res) => {
	if (req.isAuthenticated ()) {
		User.find ({}, (err, doc) => {
			if (err) res.send (eRes ('error:'+err))
			else if (doc && doc.length > 0)
				res.send (sRes (doc));
			else res.send (eRes ('no data found'));
		})
	}
});

router.get ('/sessioninfo', (req, res) => {
	if (req.isAuthenticated())
		res.send (sRes (req.user));
	else
		res.send (eRes ('User not authenticated'));
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

router.post ('/signup', (req, res) => {
    let data = req.body;
    console.log (data);
    if (data.username && data.password && data.phone && data.email && data.type) {
		mongoose.Promise = es6Promise;
		mongoose.connect (config.host, config.db);
		User.findOne ({username: data.username}, (err, doc) => {
			if (err) {
				res.send ({status: 'error', message: 'some error occurred: '+ err});
				mongoose.disconnect ();
			}
			else if (doc) {
				res.send ({status: 'error', message: 'username already exists'});
				mongoose.disconnect ();
			}
			else {
				var user = new User ({
					username: data.username,
					email: data.email,
					password: data.password,
					phone: data.phone,
					type: data.type
				});

				user.save ().then (() => {
					res.send ({status: 'success', message: 'User created successfully', raw: user});
					mongoose.disconnect ();
				});
			}
		})
	} else {
		res.send ({status: 'error', message: 'incomplete data'});
	}
});

router.put ('/update/:id', (req, res) => {
	var data = req.body;
	// console.log ('request here');
	if (data.username && data.password && data.phone && 
		data.email && data.type) {

		if (req.params.id) {

			mongoose.Promise = es6Promise;
			mongoose.connect (config.host, config.db);

			User.findOne ({_id: req.params.id}, (err, doc) => {
				if (err) res.send (eRes ('Server error: '+ err))
				else if (doc) {
					doc.username = data.username;
					doc.password = data.password;
					doc.phone = data.phone;
					doc.email = data.phone;
					doc.type = data.type;

					doc.save (). then (() => {
						mongoose.disconnect ();
						res.send ({status: 'success', message: 'authenticated', data: doc});
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
				mongoose.Promise = es6Promise;
				mongoose.connect (config.host, config.db);

				User.remove ({_id: req.params.id}, (err) => {
					if (err) res.send (eRes ('error deleting: '+ err));
					else res.send (sRes ('deleted'));

					mongoose.disconnect ();
				});
			} else res.send (eRes ('Id not sent'));
		} else res.send (eRes ('You need to be admin'));
	} else res.send (eRes ('login first'));
});

module.exports = router;