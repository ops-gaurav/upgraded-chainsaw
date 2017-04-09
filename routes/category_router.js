/**
 * @description routes related to product categories
 * @author Gaurav Sharma
 */

import express from 'express';
import Category from '../models/category_model';
import controller from '../controllers/category_controllers';
import sessionAuth from '../controllers/session_auth_controller';

var router = express.Router();

router.get ('/all',sessionAuth.userAuthenticated , controller.all);

router.post ('/add/:category', sessionAuth.adminAuthenticated, controller.addCategory);

router.put ('/update/:id/:category', sessionAuth.adminAuthenticated, controller.updateCategory);

router.get ('/get/:category', sessionAuth.userAuthenticated, controller.getByName);

module.exports = router;