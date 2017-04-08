
/**
 * CONTROLLER for products
 * @author gaurav sharma
 * @description This controller contains the middleware to handle
 * the requests related to products
 */

import fs from 'fs';

import ProductModel from '../models/product_model';
import ImageUploader from '../middlewares/image_middleware';
import response from '../utility/response_generator';

var exports = module.exports = {};

/**
 * a middleware controller to get all products
 */
exports.getAll =  (req, res, next) => {
    ProductModel.allProducts ((err, data) => {
        if (err) {
            res,send (response.error (err));
        } 
        else if (data) {
            res.send (response.success (data));
        } 
        else {
            res.send (response.error ('Login first'));
        }
    });
}

exports.getById = (req, res, next) => {
    ProductModel.getById (req.params.id, (err, doc) => {
        if (err) {
            res.send (response.error (err));
        } else if (doc) {
            res.send (response.success (doc))
        } else {
            res.send (response.error ('No data'));
        }
    });
}

/**
 * add a new product in the database
 */
exports.addNewProduct = (req, res, next)  => {
    if (req.body) {
        if (req.user.doc.type == 'admin') {
            if (req.body.name && req.body.price) {
                ProductModel.createProduct (req.body, (err, doc) => {
                    if (err) {
                        res.send (error.response (err));
                    } else if (doc) {
                        res.send (response.success (doc));
                    } else {
                        res.send (response.error ('No data'))
                    }
                });
            } else {
                res.send (response.error ('Incomplete data'));
            }
        } else {
            res.send (response.error ('Unauthorized access'));
        }
    } else {
        res.send (response.error ('Incomplete data'));
    }
}

/**
 * upload image controller
 */
exports.addImage = (req, res, next) => {
    ImageUploader (req, res, (err) => {
        if (err) {
            res.send (response.error (err));
        } else {
            var imageData = {
                mimetype: req.image.mimetype,
                id: req.user.username
            }
            ProductModel.persistImageProperties (req.params.id, imageData, (err, doc) => {
                if (err) {
                    res.send (response.error (err));
                }
                else if (doc) {
                    res.send (response.success (doc));
                }
                else {
                    res.send (response.error ('no data'));
                }
            });
        }
    });
}

// getting the image
exports.getImage = (req, res, next) => {
   var image = undefined;
    try {
        image = fs.readFileSync (__dirname +'/../tempUploads/'+ req.params.id);
        res.contentType (req.params.mime.replace ('-', '/'));
    } catch (e) {
        if (e.code === 'ENOENT') {
            image = fs.readFileSync (__dirname + '../public/images/profile.png');
            res.contentType ('image/png');
        }
    }
    res.end (image, 'binary');
}

// UPDATE an existing user
//
exports.updateUser = (req, res, next) => {
    if (req.user.doc.type == 'admin') {
        if (req.body.name && req.body.price && req.body.category) {
            
            var updateDoc = {
                name: req.body.name,
                price: req.body.price,
                category: req.body.category
            };

            ProductModel.updateProduct (req.params.id, updateDoc, (err, doc) => {
                if (err) {
                    res.send (response.error (err));
                }
                else if (doc) { 
                    res.send (response.success (doc));
                }
                else {
                    res.send (response.error ('no data'));
                }
            });
        } else{
            res.send (response.error (''));
        }
    } else{
        res.send (response.error ('Unauthorized access'));
    }
}

/**
 * deleting a product from database
 */
exports.deleteProduct =   (req, res, next) => {
    if (req.user.doc.type =='admin') {
        if (req.params.id) {
            ProductModel.removeProduct (req.params.id, (err, doc) => {
                if (err) {
                    res.send (response.error (err));
                }
                else if (doc) {
                    res.send (response.success('deleted'));
                }
                else {
                    res.send (response.error ('no data'));
                }

            });
        } 
    } else {
        res.send (response.error ('Unauthorized access'));
    }
}