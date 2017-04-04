import passport from 'passport';
import User from '../models/user_model';
import LocalStrategy from 'passport-local';

passport.use ('PasswordAuth', new LocalStrategy ({
	usernameField: 'username',
	passwordField: 'password'
}, (username, password, done) => {
	User.getByUsername (username, (err, data) => {
		if (err) done (err);
		else if (data) {
			console.log (data);
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
				done (null, newData);
			} else done (null, false, {failureFlash: 'incorrect password'});
		} else done (null, false, {failureFlash: 'username error'});
	})
}));

passport.serializeUser ((user, done) => {
    return done (null, user);
});
passport.deserializeUser ((user, done) => {
    done (null, user);
});

module.exports = passport;