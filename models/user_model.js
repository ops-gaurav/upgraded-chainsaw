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

// module.exports.allUsers = function (next) {
//     User.find ({}, (err, doc) => {
//         if (err) next (err, undefined);
//         else if (doc && doc.length > 0)
//             next (undefined, doc);
//         else 
//             // no data
//             next (undefined, undefined);
//     });
// }

// module.exports.getByUsername = function (uname, next) {
//     User.findOne ({username: uname}, (err, doc) => {
//         if (err) next (err, next);
//         else if (doc) next (undefined, doc);
//         else next (undefined, undefined);
//     });
// }


module.exports.model = User;