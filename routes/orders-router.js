var router = require ('express').Router();

import Product from '../models/product_model';
import Order from '../models/orders_model';

import response from '../utility/response_generator';
var config = require ('../data/config');

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
            Product.findOne ({_id: req.params.productId}, (err, data) => {
                if (err) res.send ({status: 'error', message: 'server errror '+ err});
                else if (data) {
                    // product is a valid product
                    var order = new Order ({
                        _user: req.user.doc._id,
                        _product: req.params.productId,
                        time: new Date().getTime()
                    });

                    order.save ().then (() => {
                        res.send ({status: 'success', message: 'Order placed'});
                    });
                } else
                    res.send (response.error('product not available'));
            });
        } else res.send (response.error ('require product id'));
    } else res.send (response.error ('Login first'));
});

router.get ('/myorders', (req, res) => {
    if (req.isAuthenticated()) {
        console.log (req.user);
        Order.find ({_user: req.user.doc._id}).populate ('_product', '_id name price image').exec ((err, data) => {
            if (err) res.send ({status: 'error', message: err});
            else res.send ({status: 'success', data: data});
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
        Order.find ({}, (err, doc) => {
            if (err) res.send ({status: 'error', message: 'error: '+ error});
            else if (doc && doc.length > 0) res.send ({status: 'success', data: doc});
            else res.send ({status: 'error', message: 'No data'});
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

            Order.find ({}).populate('_user', 'phone username email').populate ('_product', "name price").exec ((err, data) => {
                if (err) res.send ({status: 'error',message: err});
                else res.send (data);
                
            });
        } else res.send (response.error ('Unauthorized access'));
    } else res.send (response.error ('Login first'));
});

router.get ('/multiPopulate', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            Order.find ({}).populate ('_user').populate('_product').exec ((err, data) => {
                if (err) res.send ({status:'error', message: 'server error: '+ err});
                else res.send (data);
            });
        } else res.send (response.error ('Unauthorized access'));
    } else res.send (response.error ('Login first'));
});

module.exports = router;