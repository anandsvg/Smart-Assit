function RabbitMQ() {

}

var subscribeCallbacks = {},
	subscribeAllCallbacks = {};

RabbitMQ.prototype.init = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'init', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.shutdown = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'shutdown', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.online = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'online', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.offline = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'offline', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.publish = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'publish', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.subscribe = function(data, callback) {
	subscribeCallbacks[data.uid] = callback;

	cordova.exec(
		function(data) {
			// Parse callback data
			data = JSON.parse(data);

			console.log(JSON.stringify(data));

			// Check callback exists
			if (subscribeCallbacks[data.uid]) {
				subscribeCallbacks[data.uid](data);
			}
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'subscribe', [JSON.stringify(data)]
	);
	subscribeToIntent({
		intent: "com.simplassist.simpl.MessageReceived",
		//type: data.type,
		uid: data.uid,
		callback: callback
	});
};

RabbitMQ.prototype.unsubscribe = function(data, callback) {
	cordova.exec(
		function(data) {
			callback(data);
		}, function(err) {
			callback(err);
		},
		'RabbitMQ',
		'unsubscribe', [JSON.stringify(data)]
	);
};

RabbitMQ.prototype.subscribeAll = function(data, callback) {
	subscribeAllCallbacks[data.type] = callback;

	if (_.indexOf(['start', 'stop'], data.type) > -1) {
		cordova.exec(
			function(data) {
				// Parse callback data
				data = JSON.parse(data);

				console.log(JSON.stringify(data));

				// Check callback exists
				if (subscribeAllCallbacks[data.type]) {
					subscribeAllCallbacks[data.type](data);
				}
			}, function(err) {
				callback(err);
			},
			'RabbitMQ',
			'subscribe-all', [JSON.stringify(data)]
		);
	} else {
		subscribeToIntent({
			intent: "com.simplassist.simpl.MessageReceived",
			type: data.type,
			callback: callback
		});
	}
};

module.exports = new RabbitMQ();