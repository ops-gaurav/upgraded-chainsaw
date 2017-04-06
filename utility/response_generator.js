module.exports = {
	success: function (message){
		return {status: 'success', message: message, code: 200};
	},

	error: function (message) {
		return {status: 'error', message: message, code: 201};
	}
}