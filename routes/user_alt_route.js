import express from 'express';
import User from '../models/user_model';
import PassportAuth from '../middlewares/passport_auth';
let router = express.Router();

router.post ('/auth', PassportAuth.authenticate ('PasswordAuth', {
	failureFlash: 'error authenticating',
	successFlash: 'success authenticating'
}) ,(req, res) => {
	res.send ({status: 'success', message: req.user});
})

module.exports = router;