import mongoose from 'mongoose';
import config from '../data/config'
import pr from 'es6-promise';

var es6Promise = pr.Promise;

var Schema = mongoose.Schema;

mongoose.Promise = es6Promise;
mongoose.connect (config.host, config.db);

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