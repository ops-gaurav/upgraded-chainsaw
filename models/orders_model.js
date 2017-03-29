import mongoose from 'mongoose';
var Schema = mongoose.Schema;

import User from '../models/user_model';

var OrderSchema = new Schema ({
    _user: {type: Schema.Types.ObjectId, ref: 'User'},
    // use populate to join product information
    _product: {type: Schema.Types.ObjectId, ref: 'Product'},
    time: Number
});

var Orders = mongoose.model ('Order', OrderSchema);


module.exports = Orders;