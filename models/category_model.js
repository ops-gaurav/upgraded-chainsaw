import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var CategorySchema = new Schema ({
    name: String,
    image: {
        mimetype: String,
        image: Buffer
    }
});

var Category = mongoose.model ('category', CategorySchema);

/**
 * for all categories
 */
module.exports.allCategories = (next) => {
    Category.find ({}, (err, doc) => {
        if (err) {
            next (err, undefined);
        } else if (doc && doc.length > 0) {
            next (undefined, doc);
        } else {
            next (undefined, undefined);
        }
    });
};

/**
 * adding a new category
 * @param {string} category represents category name
 * @param {function} next represents callback
 */
module.exports.addCategory = (name, next) => {
    Category.findOne ({name: name}, (err, doc) => {
        if (err) {
            next (err, undefined);
        } else if (doc) {
            next ('Category already exists', undefined);
        } else {
            console.log (category);
            var category = new Category ({
                name: name
            });babel

            category.save(). then (() => {
                next (undefined, 'Saved');
            });
        }
    });
};

/**
 * updates an existing category
 * @param {string} id represents the category id
 * @param {string} newName represents the category's name
 * @param {function} next represents the callback  
 */
module.exports.updateCategory = (id, newName, next) => {
    Category.findOne ({_id: id}, (err, doc) => {
        if (err) {
            next (err, undefined)
        }
        else if (doc) {
            doc.name = newName;

            doc.save().then (() => {
                next (undefined, 'updated');
            });
        } else {
            next (undefined, undefined);
        }
    });
};

/**
 * checks whether the sent category is unique or not
 * @param {string} category represents category to find
 * @param {function} next represents the callback  
 */
module.exports.getCategory = (category, next) => {
    Category.findOne ({name: category}, (err, doc) => {
        if (err) {
            next (err, undefined);
        }
        else if (doc) {
            next (undefined, 'found');
        } else {
            next (undefined, undefined);
        }
    });
};

module.exports.category = Category;