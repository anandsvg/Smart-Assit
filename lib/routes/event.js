var express = require('express'),
	Event = require('../Event'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
	Event.getEvents(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/:id?', function(req, res) {
	Event.getEvent(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.post('/', function(req, res) {
	Event.addEvent(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.put('/:id?', function(req, res) {
	Event.updateEvent(req, function(ret) {
		res.end();
	});
});

app.delete('/:id?', function(req, res) {
	Event.removeEvent(req, function(ret) {
		res.end();
	});
});