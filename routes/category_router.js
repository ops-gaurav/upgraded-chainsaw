import express from 'express';
import Category from '../models/cateory_model';

var router = express.Router();

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