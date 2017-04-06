import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ProductSchema = new Schema ({
    name: String,
    price: Number,
    category: String,
    deleted: Boolean,
    image: {
        mime: String,
        value: String
    }
});

var Products = mongoose.model ('Product', ProductSchema);

module.exports.product = Products;

/**
 * fetch all the products
 */
module.exports.allProducts = function (next) {
    Products.find ({}, (err, docs) => {
        if (err) next (err, undefined);
        else if (docs && docs.length > 0) next (undefined, docs);
        else next (undefined, undefined);
    });
}

/**
 * fetch the product by id
 */
module.exports.getById = function (id, next) {
    Products.findOne ({_id: id}, (err, data) => {
        if (err) next (err, undefined);
        else if (data) next (undefined, data);
        else next (undefined, undefined);
    });
}

/**
 * create a product
 */
module.exports.createProduct = function (pData, next) {
    var product = new Products ({
        name: pData.name,
        price: pData.price,
        deleted: false,
        category: pData.category
    });

    product.save (). then (() =>{
        next (undefined, product);
    });
}

module.exports.persistImageProperties = function (pId, imageData, next) {
    Products.findOne ({_id: pid}, (err, doc) => {
        if (err) res.send (err, undefined);
        else if (doc) {
            doc.image = {
                mime: imageData.mimetype.replace ('/', '-'),
                value: 'product_'+ imageData.id +'_pic'
            }

            doc.save (). then (() => {
                next (undefined, doc);
            });
        }
        else next (undefined, undefined);
    })
}

/**
 * update an existing user
 */
module.exports.updateProduct = function (id, data, next) {
    Products.update ({_id: id}, data, (err, data) => {
        if (err) next (err, undefined);
        else if (data) next (undefined, data);
        else next (undefined, undefined);
    });
}

/**
 * soft delete a user
 */
module.exports.removeProduct = function (id) {
    Products.findOne ({_id: id}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc) {
            doc.deleted = true;
            doc.save ().then (() => {
                next (undefined, doc);
            });
        } else next (undefined, undefined);
    });
}