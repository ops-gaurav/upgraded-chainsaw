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

module.exports = Category;