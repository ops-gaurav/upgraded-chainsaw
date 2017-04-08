var router = require ('express').Router();
import fs from 'fs';

import ProductModel from '../models/product_model';
import ImageMiddleware from '../middlewares/image_middleware';
import response from '../utility/response_generator';

const Product = ProductModel.product;

/**
 * route to get all the users
 */
router.get ('/all', (req, res) => {
	if (req.isAuthenticated ()) {
        ProductModel.allProducts ((err, data) => {
            if (err) res.send (response.error (err));
            else if (data) res.send (response.success (data));
            else res.send (response.error ('No data'));
        });
	} else res.send (response.error ('Login first'));
});

/**
 * get product by id
 */
router.get ('/get/:id', (req, res) => {
    var id = req.params.id;
    if (req,isAuthenticated ()) {
        ProductModel.getByid (req.params.id, (err, doc) => {
            if (err) res.send (response.error (err));
            else if (doc) res.send (response.success (doc));
            else res.send (response.error ('No data'));
        })
    }else res.send (response.error ('Login first'));
})

/**
 * add new product
 */
router.post ('/add', (req, res) => {
    var data = req.body;
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            if (data.name && data.price) {
                ProductModel.createProduct (data, (err, doc) => {
                    if (err) res.send (response.error (err));
                    else if (doc) res.send (response.success (doc));
                    else res.send (response.error ('no data'));
                });
                // var product = new Product({
                //     name: data.name,
                //     price: data.price,
                //     deleted: false,
                //     category: data.category
                // });

                // product.save().then (() => {
                //     res.send ({status: 'success', message: 'product saved', raw: product});
                // });
            } else {
                res.send ({status: 'error', message: 'Incomplete data'});
            }
        }
    } else
        res.send ({status: 'error', message: 'login first'});
});

router.put ('/addImage/:id', (req, res) => {
    MulterMiddleware (req, res, (err) => {
        if (err) res.send ({status: 'error', message: 'error uploading: '+ err});
        else {
            var imageData = {
                mimetype: req.image.mimetype,
                id: req.user.username
            }
            ProductModel.persistImageProperties (req.params.id, imageData, (err, doc) => {
                if (err) res.send (response.error (err));
                else if (doc) res.send (response.success (doc));
                else res.send (response.error ('no data'));
            });
        }
    });
});

router.get ('/image/:id/:mime', (req, res) => {
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
});

/**
 * update a user
 */
router.put ('/update/:id', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {

            if (req.body.name && req.body.price && req.body.category) {
                
                var updateDoc = {
                    name: req.body.name,
                    price: req.body.price,
                    category: req.body.category
                }

                ProductModel.updateProduct (req.params.id, updateDoc, (err, doc) => {
                    if (err) res.send (response.error (err));
                    else if (doc) res.send (response.success (doc));
                    else res.send (response.error ('no data'));
                });
            } else
                res.send ({status:'error', message: 'Incomplete data'});
        } else
            res.send ({status: 'error', message: 'Unauthorized access. You need to be admin'});
    } else
        res.send ({status: 'error', message: 'please login as admin first'});
});

/**
 * do not raw delete the product, only add a field indicating whether the 
 * product is available or not
 */
router.delete ('/delete/:id', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type =='admin') {
            if (req.params.id) {
                ProductModel.removeProduct (req.params.id, (err, doc) => {
                    if (err) res.send (response.error (err));
                    else if (doc) res.send (response.success('deleted'));
                    else res.send (response.error ('no data'));

                });
            } else res.send ({status: 'error', message: 'require id to delete'});
        }
    }
});

module.exports = router;