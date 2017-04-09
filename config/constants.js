import path from 'path';

var exports = module.exports = {
    getFile: (filename) => {
        return path.join (__dirname, '../views/'+ filename);
    }
};