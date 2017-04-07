import mongoose from 'mongoose';
var Schema = mongoose.Schema;

import User from '../models/user_model';
import ProductModel from '../models/product_model';

var OrderSchema = new Schema ({
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    // use populate to join product information
    _product: {type: Schema.Types.ObjectId, ref: 'Product'},
    time: Number
});

var Order = mongoose.model ('Order', OrderSchema);


module.exports.order = Order;

/**
 * order a product
 * reqData is of the format 
 * {
 *      userid:
 *      productId:
 * }
 */
module.exports.orderProduct = function (reqData, next) {
    ProductModel.getById (reqData.productId, (err, data) => {
        if (err) next (err, undefined);
        else if (data) {
            // product is avaialble
            var order = new Order({
                _user: reqData.userid,
                _product: reqData.productId,
                time: new Date().getTime()
            });

            order.save (). then (() => {
                next (undefined, "order placed");
            });
        } else next (undefined, undefined);
    });
}

/**
 * get the users orders
 */
module.exports.userOrders = function (id, next) {
    Order.find ({_user: id}).populate ('_product', '_id name price image').exec ((err, data) => {
        if (err) next (err, undefined);
        else if (data) next (undefined, data);
        else next (undefined, undefined);
    });
}

module.exports.removeOrder = function (next) {
    Order.remove ({_id: req.params.id}).then (() => {
        next (undefined, 'order deleted');
    });
}

// get all orders
module.exports.orders = function (next) {
    Order.find ({}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc && doc.length>0) next (undefined, doc);
        else next (undefined, undefined);
    });
}

/**
 * the populated list of orders
 */
module.exports.allOrders = function (next) {
    Order.find ({}).populate ('_user', 'phone username email').populate ('_product', 'name price').exec ((err, data) => {
        if (err) next (err, undefined);
        else if (data && data.length > 0) next (undefined, data);
        else next (undefined, undefined)
    });
}

/**
 * get the list of complete orders with complete populate of user and product
 */
module.exports.completeOrders = function (next) {
    Order.find ({}).populate ('_user').populate ('_product').exec ((err, data) => {
        if (err) next (err, undefined);
        else if (data && data.length > 0) next (undefined, data);
        else next (undefined, undefined);
    });
}