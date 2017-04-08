var router = require ('express').Router();

import Product from '../models/product_model';
import OrderModel from '../models/orders_model';

let Order = OrderModel.order;

import response from '../utility/response_generator';
import config from '../config/config';

/**
 * UPDATE THE ORDER MODEL TO CONTAIN THE BUILT IN FUNCTIONS
 */

/**
 * order a product
 */
router.post ('/add/:productId', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.params.productId) {
            // check if it is a valid product
            OrderModel.orderProduct ({userid: req.user.doc._id, productId: req.params.productId}, (err, data) => {
                if (err) res.send (response.error (err));
                else if (data) res.send (response.success ('Order places'));
                else res.send (response.error ('data not found'));
            });
        } else res.send (response.error ('require product id'));
    } else res.send (response.error ('Login first'));
});

router.get ('/myorders', (req, res) => {
    if (req.isAuthenticated()) {
        OrderModel.userOrders (req.user.doc._id, (err, data) => {
            if (err) res.send (response.error (err));
            else if(data) res.send (response.success (data));
            else res.send (response.error ('No data'));
        });
    } else res.send (response.error ('Login first'));
});

router.delete ('/remove/:id', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            if (req.params.id) {
                Order.remove ({_id: req.params.id}).then (() => {
                    res.send ({status: 'success', message: 'order deleted successfully'});
                });
            } else res.send (response.error ('require order id to delete as params'));
        } else res.send (response.error ('Unauthorized access'));
    } else res.send (response.error ('Login first'));
});

router.get ('/all', (req, res) => {
    if (req.isAuthenticated ()){
        OrderModel.orders ((err, data) => {
            if (err) res.send (response.error (err));
            else if (data) res.send (response.success (data));
            else res.send (response.success ('No data'));
        });
    } else res.send (response.error ('Login first'));
});

/**
 * get all the orders in the database
 * for admin only
 */
router.get ('/populate', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {

            OrderModel.allOrders ((err, data) => {
                if (err) res.send (response.error (err));
                else if (data) res.send (response.success (data));
                else res.send (response.error (data));
            });
        } else res.send (response.error ('Unauthorized access'));
    } else res.send (response.error ('Login first'));
});

router.get ('/multiPopulate', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            OrderModel.completeOrders((err, data) => {
                if (err) res.send (response.error (err));
                else if (data) res.send (response.success (data));
                else res.send (response.error ('no data'));
            });
        } else res.send (response.error ('Unauthorized access'));
    } else res.send (response.error ('Login first'));
});

module.exports = router;