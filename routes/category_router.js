import express from 'express';
import Category from '../models/category_model';
import controller from '../controllers/category_controllers';

var router = express.Router();

router.get ('/allCategories', controller.all);

// get all categories
router.get ('/all', (req, res) => {
    if (req.isAuthenticated ()) {
        Category.find ({}, (err, doc) => {
            if (err) res.send (eRes ('some error :'+ err));
            else if (doc && doc.length > 0) res.send (sRes (doc));
            else res.send (eRes ('No data'));
        })
    } else res.send (sRes ('Login first'));
})

router.post ('/add/:category', (req, res) => {
    if (req.isAuthenticated()) {
        Category.findOne ({name: req.params.category}, (err, doc) => {
            if (err) res.send (eRes ('some error :'+ err));
            else if (doc) {
                res.send (eRes ('Category already exists'));
            } else {
                var category = new Category ({
                    name: req.params.category
                });

                category.save (). then (()=>{
                    res.send (sRes ('saved new category'));
                });
            }
        })
    } else res.send (eRes ('Login first'));
});

/**
 * updating the category
 */
router.put ('/update/:id/:category', (req, res) => {
    if (req.isAuthenticated()) {
        if (req.user.doc.type == 'admin') {
            Category.findOne ({_id: req.params.id}, (err, doc) => {
                if (err) res.send (eRes ('Server error: '+ err));
                else if (doc) {
                    doc.name = req.params.category;

                    doc.save().then (() => {
                        res.send (sRes ('Updated'));
                    });
                } else res.send (eRes ('No data found'));
            })
        } else res.send ('Cannot access');
    } else res.send (eRes ('Login first'));
});

/**
 * checks whether the sent category is unique or not
 */
router.get ('/get/:category', (req, res) => {
    if (req.isAuthenticated ()) {
        Category.findOne ({name: req.params.category}, (err, doc) => {
            if (err) res.send (eRes ('error: '+ err));
            else if (doc) {
                res.send (sRes ("found"));
            } else res.send (eRes ('not found'));
        });
    } else res.send (eRes ('Login first'));
})

function eRes (message) {
    return {status: 'error', message: message};
}
function sRes (message) {
    return {status: 'success', message: message};
}

module.exports = router;