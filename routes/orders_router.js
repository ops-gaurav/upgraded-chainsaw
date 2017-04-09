/**
 * @description routes related to the orders
 * @author gaurav sharma
 */
var router = require ('express').Router();

import sessionAuth from '../controllers/session_auth_controller';
import controller from '../controllers/orders_controller';
/**
 * order a product
 */
router.post ('/add/:productId', sessionAuth.userAuthenticated, controller.orderProduct);

// listing the orders of user in session
router.get ('/myorders', sessionAuth.userAuthenticated, controller.listUserOrders);

// removing the user based on the id
// require admin access to call
router.get ('/remove/:id', sessionAuth.adminAuthenticated, controller.removeOrder);

// get all orders
// UN-POPULATED
router.get ('/all', sessionAuth.userAuthenticated, controller.getAllOrders);

/**
 * get all the orders in the database
 * for admin only
 */
router.get ('/populate', sessionAuth.userAuthenticated, controller.getUserPopulatedOrders);

router.get ('/multiPopulate', sessionAuth.adminAuthenticated, controller.getPopulatedResult);

module.exports = router;