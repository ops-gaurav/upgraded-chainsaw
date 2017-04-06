import multer from 'multer';
import path from 'path';
import config from '../data/config';

var storage = multer.diskStorage ({
	destination: (req, res, next) => {
		console.log (__dirname);
		next (null, __dirname+'/../tempUploads');
	},
	filename: (req, file, next) => {

		req.image = {};
		req.image.mimetype = file.mimetype;

		next (null, req.user.doc.username +'_avatar');
	}
});

let upload = multer ({storage: storage}).single ('avatar');

module.exports = upload;