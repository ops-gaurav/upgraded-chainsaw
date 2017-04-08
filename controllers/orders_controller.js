/**
 * @author Gaurav Sharma
 * @description The controller middleware to handle the orders
 * requests
 */

import OrderModel from '../models/orders_model';
import response from '../utility/response_generator';

var exports = module.exports = {};

/**
 * Order a product
 * @param {string} id as product id
 */
exports.orderProduct = (req, res, next) => {
    OrderModel.orderProduct ({userid: req.user.doc._id, productId: req.params.productId}, (err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success (data))
        } else {
            res.send (response.error ('No data found'))
        }
    })
};

/**
 * List the products of the user in session
 */
exports.listUserOrders = (req, res, next) => {
    OrderModel.userOrders (req.user.doc._id, (err, data) => {
        if (err) {
            res.send (response.error (err));
        }
        else if(data) {
            res.send (response.success (data));
        }
        else {
            res.send (response.error ('No data'));
        }
    });
}

/**
 * remove the order from the database. require admin access
 * @param {string} id as params
 */
exports.removeOrder = (req, res, next) => {
    if (req.user.doc.type == 'admin') {
        OrderModel.removeOrder (req.params.id, (err, data) => {
            if (err) {
                res.send (response.error (err));
            } else {
                res.send (response.success ('success'));
            }
        });
    } else {
        res.send (response.error ('Unauthorized access'));
    }
};

/**
 * get all the orders. require admin access.
 * WITHOUT MONGO POPULATION
 */
exports.getAllOrders = (req, res, next) => {
    OrderModel.orders ((err, data) => {
        if (err) {
            res.send (response.error (err));
        } else if (data) {
            res.send (response.success (data));
        } else {
            res.send (response.error ('No data'))
        }
    })
}

/**
 * get all the orders with the user populated. require admin access
 */
exports.getUserPopulatedOrders = (req, res, next) => {
    if (req.user.doc.type == 'admin') {
        OrderModel.allOrders ((err, data) => {
            if (err) res.send (response.error (err));
            else if (data) res.send (response.success (data));
            else res.send (response.error (data));
        });
    } else res.send (response.error ('Unauthorized access'));
}

/**
 * get the complete populated result
 */
exports.getPopulatedResult = (req, res, next) => {
    if (req.user.doc.type == 'admin') {
        OrderModel.completeOrders((err, data) => {
            if (err) res.send (response.error (err));
            else if (data) res.send (response.success (data));
            else res.send (response.error ('no data'));
        });
    } else res.send (response.error ('Unauthorized access'));
}