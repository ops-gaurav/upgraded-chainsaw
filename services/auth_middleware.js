import passport from 'passport';
import PassJWT from 'passport-jwt';

import User from '../models/user_model';
import LocalStrategy from 'passport-local';
import response from '../utility/response_generator';

const exports = module.exports = {};
const JwtStrategy = PassJWT.Strategy;
const ExtractJwt = PassJWT.ExtractJWT;

var options = {};
options.jwtFromRequest = ExtractJWT.fromAuthHeaer();
options.secretOrKey = 'winteriscoming';

var strategy = new JwtStrategy (options, function (jwt_payload, next) {
	console.log ('payload received: '+ jwt_payload);

	User.getByUsername (jwt_payload.username, (err, data) => {
		if (err) next (err, undefined);
		else if (data) {
		}
	});
});

passport.use ('PasswordAuth', new LocalStrategy ({
	usernameField: 'username',
	passwordField: 'password'
}, (username, password, done) => {
	console.log ('here');
	User.getByUsername (username, (err, data) => {
		if (err) done (err, undefined);
		else if (data) {
			if (data.password == password) {
				var newData = {};
				
				if (data.type == 'admin') 
					newData = {
						redirect: '/admin',
						doc: data
					};
				else 
					newData = {
						redirect: '/user',
						doc: data
					}
				done (undefined, newData);
			} else done ('Passwords did not match', undefined);
		} else done ('No data', undefined);
	})
}));


passport.serializeUser ((user, done) => {
    return done (null, user);
});
passport.deserializeUser ((user, done) => {
    done (null, user);
});

exports.authenticateUser = (req, res, next) => {
	passport.authenticate ('PasswordAuth', (err, user) =>{
		if (err) {
			res.send (response.error (err));
		} else if (user) {
			req.login (user, (err) => {
				if (err) {
					res.send (response.error (err));
				} else {
					res.send (response.success (user));
				}
			});
		} else {
			res.send (response.error ('Login first'))
		}
	})(req, res, next);
};