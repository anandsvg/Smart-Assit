define([
	'app',
	'cryptojs',
	'sha1',
], function(app) {
	app.register.service('UUID', function() {
		return function() {
			var data = [];
			for (var i = 0; i < 5000; i++) {
				data.push(String.fromCharCode(Math.floor(Math.random() * 256)));
			}
			return Crypto.SHA1(data.join(''));
		}
	})
});