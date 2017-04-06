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

module.exports.allUsers = function (next) {
    User.find ({}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc && doc.length > 0)
            next (undefined, doc);
        else 
            // no data
            next (undefined, undefined);
    });
}

module.exports.getByUsername = function (uname, next) {
    User.findOne ({username: uname}, (err, doc) => {
        if (err) next (err, next);
        else if (doc) next (undefined, doc);
        else next (undefined, undefined);
    });
}

module.exports.saveUser = function (data, next) {
    User.findOne ({username: data.username}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc) {
            next (undefined, {status: 'error', message: 'user already exists'});
        } else {
            var user = new User ({
                username: data.username,
                email: data.email,
                password: data.password,
                phone: data.phone,
                type: data.type
            });

            user.save ().then (() => {
                next (undefined, {status: 'success', message: 'User created successfully', raw: user});
            });
        }
    });
}
module.exports.update = function (data, next) {
    User.findOne ({_id: data._id}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc) {
            doc.username = data.username;
            doc.password = data.password;
            doc.phone = data.phone;
            doc.email = data.email;
            doc.type = data.type;

            doc.save (). then (() => {
                next (undefined, {status: 'success', message: 'updated'});
            });
        } else next (undefined, undefined);
    });
}

module.exports.delete = function (id, next) {
    User.remove ({_id: id}, err => {
        if (err) next (err, undefined);
        else next (undefined, {status: 'success', message: 'deleted'});
    });
}

/**
 * imageData contains the image properties 
 * image.mime - > contains MIME type
 * imeg.value -> contains file path
 */
module.exports.persistImageProperties = function (id, imageData, next) {
    User.findOne ({_id: id}, (err, doc) => {
        if (err) next (err, undefined);
        else if (doc) {
            doc.image = {
                mime: imageData.mimetype.replace ('/', '-'),
                value: imageData.username +'_avatar'
            };

            doc.save (). then (() => {
                next (undefined, {status: 'success', message: 'image added'});
            });
        } else next (undefined, undefined);
    });
}


module.exports.user = User;