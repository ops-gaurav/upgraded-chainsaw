import express from 'express';

import AuthMiddleware from '../services/auth_middleware';
import controller from '../controllers/user_controller';
import sessionAuth from '../controllers/session_auth_controller';

let router = express.Router();

/**
 * get all the users
 */
router.get ('/all', sessionAuth.userAuthenticated, controller.allUsers);

router.get ('/sessioninfo', sessionAuth.userAuthenticated, controller.sessionInfo);

router.get ('/logout', sessionAuth.userAuthenticated, controller.logout);

router.post ('/auth', AuthMiddleware.authenticateUser);

/**
 *  create a new user
 */
router.post ('/signup', controller.createUser);

router.get ('/usernameLookup/:username', sessionAuth.userAuthenticated, controller.findByUsername);

/**
 * WORKING
 */
router.put ('/update/:id', sessionAuth.userAuthenticated, controller.updateUser);

/**
 * delete the existing user
 */
router.delete ('/delete/:id', sessionAuth.adminAuthenticated, controller.deleteUser);

/**
 * route to add image
 */
router.put ('/addImage/:id', sessionAuth.userAuthenticated, controller.addUserImage);

router.get ('/image/:id/:mime', sessionAuth.userAuthenticated, controller.getUserImage);
module.exports = router;