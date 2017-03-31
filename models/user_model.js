import mongoose from 'mongoose';

var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: String,
    password: String,
    phone: String,
    email: String,
    type: String,
    image: {
        mime: String,
        value: String   // contains path
    }
});

var User = mongoose.model ('User', UserSchema);

module.exports = User;