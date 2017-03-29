var router = require ('express').Router();
var mongoose = require ('mongoose');
var es6Promise = require ('es6-promise').Promise;

import Product from '../models/product_model';
import Order from '../models/orders_model';

var config = require ('../data/config');


router.get ('/', (req, res) => {
    res.send ({status: 'success', message: 'success'});
});
/**
 * order a product
 */
router.post ('/add/:productId', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.params.productId) {

            mongoose.Promise = es6Promise;
            mongoose.connect (config.host, config.db);
            
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
                        mongoose.disconnect ();
                    });
                } else
                    res.send ({status: 'error', message: 'product not available'});
            });
        } else res.send ({status: 'error', message: 'require product id'});
    } else res.send ({status: 'error', message: 'Login first'});
});

router.get ('/myorders', (req, res) => {
    if (req.isAuthenticated()) {
        mongoose.Promise = es6Promise;
        mongoose.connect (config.host, config.db);

        Order.find ({_user: req.user.doc._id}).populate ('_product', 'name price').exec ((err, data) => {
            if (err) res.send ({status: 'error', message: err});
            else res.send ({status: 'success', data: data});

            mongoose.disconnect ();
        });
    } else res.send ({status: 'error', message: 'please login first to get your order details'});
});

router.delete ('/remove/:id', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            if (req.params.id) {
                mongoose.Promise = es6Promise;
                mongoose.connect (config.host, config.db);

                Order.remove ({_id: req.params.id}).then (() => {
                    res.send ({status: 'success', message: 'order deleted successfully'});
                    mongoose.disconnect ();
                });
            } else res.send ({status:'error', message: 'require order id to delete as params'});
        } else res.send ({status: 'error', message: 'Unauthorized access'});
    } else res.send ({status:'error', message: 'Login first'});
});

/**
 * get all the orders in the database
 * for admin only
 */
router.get ('/populate', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            mongoose.Promise = es6Promise;
            mongoose.connect (config.host, config.db);

            Order.find ({}).populate('_user', 'phone username email').populate ('_product', "name price").exec ((err, data) => {
                if (err) res.send ({status: 'error',message: err});
                else res.send (data);
                
                mongoose.disconnect ();
            });
        } else res.send ({status: 'error', message: 'Unauthorized access'});
    } else res.send ({status: 'error', message: 'Login first'});
});

router.get ('/multiPopulate', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            mongoose.Promise = es6Promise;
            mongoose.connect (config.host, config.db);

            Order.find ({}).populate ('_user').populate('_product').exec ((err, data) => {
                if (err) res.send ({status:'error', message: 'server error: '+ err});
                else res.send (data);

                mongoose.disconnect ();
            });
        } else res.send ({status: 'error', message: 'Unauthorized access'});
    } else res.send ({status: 'error', message: 'Login first'});
});

module.exports = router;