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
        value: Buffer
    }
});

var User = mongoose.model ('User', UserSchema);

module.exports = User;