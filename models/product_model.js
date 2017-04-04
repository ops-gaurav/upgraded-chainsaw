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

module.exports = Products;