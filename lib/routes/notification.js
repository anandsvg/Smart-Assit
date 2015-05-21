var express = require('express'),
	Notification = require('../Notification'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
	Notification.getNotifications(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/:id?', function(req, res) {
	Notification.getNotification(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.post('/', function(req, res) {
	Notification.addNotification(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});

});

app.put('/:id?', function(req, res) {
	Notification.updateNotification(req, function(ret) {
		res.end();
	});
});

app.delete('/:id?', function(req, res) {
	Notification.removeNotification(req, function(ret) {
		res.end();
	});
});