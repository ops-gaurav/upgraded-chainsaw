import mongoose from 'mongoose';
var Schema = mongoose.Schema;

var ProductSchema = new Schema ({
    name: String,
    price: Number,
    image: {
        mime: String,
        value: Buffer
    }
});

var Products = mongoose.model ('Product', ProductSchema);

module.exports = Products;