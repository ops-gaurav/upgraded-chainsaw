var router = require ('express').Router();
var mongoose = require ('mongoose');
var es6Promise = require ('es6-promise').Promise;
var Product = require ('../models/product_model');
var config = require ('../data/config');
import multer from 'multer';
import fs from 'fs';

var storage = multer.diskStorage ({
    destination: (req, file, next) => {
        next (null, './tempUploads');
    },
    filename: (req, file, next) => {
        req.image = {};
        req.image.mimetype = file.mimetype;
        next (null, 'product_'+ req.params.id+'_pic');
    }
});

var upload = multer ({storage: storage}).single ('avatar');

router.get ('/all', (req, res) => {
	if (req.isAuthenticated ()) {
        mongoose.Promise = es6Promise;
        mongoose.connect (config.host, config.db);

		Product.find ({}, (err, docs) => {
			if (err) 
				res.send ({status: 'error', message: 'some server error'});
			else {
				if (docs && docs.length > 0) 
					res.send ({status: 'success', data: docs});
				else
					res.send ({status:'error', message: 'no data'});
			}
            mongoose.disconnect ();
		});
	} else res.send ({status: 'error', message: 'Login first'});
});

router.get ('/get/:id', (req, res) => {
    var id = req.params.id;
    
    mongoose.Promise = es6Promise;
    mongoose.connect (config.host, config.db);

    Product.findOne ({_id: id}, (err, data) => {
        if (err) res.send ({status: 'error', message: 'server error'});
        else if (data) {
            res.send ({status: 'success', data: data});
        } else
            res.send ({status: 'error', message: 'no data'});

        mongoose.disconnect ();
    });
})
router.post ('/add', (req, res) => {
    var data = req.body;
    console.log (data);
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {

            if (data.name && data.price) {
                mongoose.promise = es6Promise;
                mongoose.connect (config.host, config.db);
                var product = new Product({
                    name: req.body.name,
                    price: req.body.price
                });

                product.save().then (() => {
                    res.send ({status: 'success', message: 'product saved', raw: product});
                    mongoose.disconnect();
                });
            } else {
                res.send ({status: 'error', message: 'Incomplete data'});
            }
        }
    } else
        res.send ({status: 'error', message: 'login first'});
});

router.put ('/addImage/:id', (req, res) => {
    upload (req, res, (err) => {
        if (err) res.send ({status: 'error', message: 'error uploading: '+ err});
        else {
            mongoose.Promise = es6Promise;
            mongoose.connect (config.host, config.db);

            Product.findOne ({_id: req.params.id}, (err, data) => {
                if (err) res.send ({status: 'error', message: 'Error: '+ err});
                else if (data) {
                    data.image = {
                        mime: req.image.mimetype.replace ('/', '-'),
                        value: 'product_'+ req.params.id +'_pic'
                    }

                    data.save (). then (() => {
                        res.send ({status: 'success', data: data});
                        mongoose.disconnect ();
                    });
                } else res.send ({status: 'error', message: 'no data'});
            });
        }
    });
});

router.get ('/image/:id/:mime', (req, res) => {
    res.contentType (req.params.mime.replace ('-', '/'));
    var image = fs.readFileSync (__dirname +'/../tempUploads/'+ req.params.id);
    res.end (image, 'binary');
});

router.put ('/update/:id', (req, res) => {
    if (req.session.user) {
        if (req.session.user.type == 'admin') {

            if (req.body.name && req.body.price) {
                mongoose.Promise = es6Promise;
                mongoose.connect (config.host, config.db);
                Product.update ({_id: req.params.id}, req.body, (err, doc) => {
                    if (err) res.send ({status:'error', message: 'server error'});
                    else res.send ({status: 'success', message: 'updated'});

                    mongoose.disconnect();
                });
            } else
                res.send ({status:'error', message: 'Incomplete data'});
        } else
            res.send ({status: 'error', message: 'Unauthorized access. You need to be admin'});
    } else
        res.send ({status: 'error', message: 'please login as admin first'});
});

router.delete ('/delete/:id', (req, res) => {
    if (req.session.user) {
        if (req.session.user.type =='admin') {
            if (req.params.id) {
                mongoose.Promise = es6Promise;
                mongoose.connect (config.host, config.db);
                Product.remove ({_id: req.params.id}).then (() => {
                    res.send ({status: 'success', message: 'success deleting product'});
                    mongoose.disconnect();
                });
            } else res.send ({status: 'error', message: 'require id to delete'});
        }
    }
});
module.exports = router;