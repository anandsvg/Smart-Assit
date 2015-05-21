var express = require('express'),
	Action = require('../Action'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
	Action.getActions(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/:id?', function(req, res) {
	Action.getAction(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.delete('/:id?', function(req, res) {
	Action.removeAction(req, function(ret) {
		res.end();
	});
});

app.put('/:id?', function(req, res) {
	Action.updateAction(req, function(ret) {
		res.end();
	});
});

app.post('/', function(req, res) {
	Action.addAction(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});

});