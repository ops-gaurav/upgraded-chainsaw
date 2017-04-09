import express from 'express';
import resolver from '../utility/resolver';
import sessionAuth from '../controllers/session_auth_controller';
import constants from '../config/constants';
const router = express.Router();

/* GET index page. */
router.get('/', (req, res, next) => {
  res.sendFile (constants.getFile ('index.html'));
});

router.get ('/admin', sessionAuth.adminAuthenticated, (req, res) => {
    res.sendFile (constants.getFile('admin.html'));
});

router.get ('/user', sessionAuth.userAuthenticated, (req, res) => {
    res.sendFile (constants.getFile ('user.html'));
})

export default router;
