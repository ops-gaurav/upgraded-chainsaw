import path from 'path';

module.exports.htmlResolver = {
	resolve: function (filename) {
		return path.resolve (__dirname , './../../views/'+ filename);
	}
};