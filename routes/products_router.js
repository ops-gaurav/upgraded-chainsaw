var router = require ('express').Router();
import fs from 'fs';

import ProductModel from '../models/product_model';
import ImageMiddleware from '../services/image_middleware';
import response from '../utility/response_generator';

const Product = ProductModel.product;

import controller from '../controllers/product_controller';
import sessionAuth from '../controllers/session_auth_controller';

/**
 * route to get all the users
 */
router.get ('/all', sessionAuth.userAuthenticated, controller.getAll);

/**
 * get product by id
 */
router.get ('/get/:id', sessionAuth.userAuthenticated, controller.getById);

/**
 * add new product
 */
router.post ('/add', sessionAuth.adminAuthenticated, controller.addNewProduct);

router.put ('/addImage/:id', sessionAuth.adminAuthenticated, controller.addImage);

router.get ('/image/:id/:mime', sessionAuth.userAuthenticated, controller.getImage);

/**
 * update a user
 */
router.put ('/update/:id', sessionAuth.adminAuthenticated, controller.updateUser);

/**
 * do not raw delete the product, only add a field indicating whether the 
 * product is available or not
 */
router.delete ('/delete/:id', sessionAuth.adminAuthenticated, controller.deleteProduct);

module.exports = router;