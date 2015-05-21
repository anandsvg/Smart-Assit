var express = require('express'),
	User = require('../User'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

// Add user
app.post('/', function(req, res) {
    console.log(req.body.firstName);

    User.add(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// Remove user
app.delete('/:id?', function(req, res) {
	User.remove(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send({
			status: 1
		});
	});
});

// Update
app.put('/:id?', function(req, res) {
	User.update(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// List users
app.get('/list', function(req, res) {
	User.list(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// Get user
app.get('/:id([0-9a-f]{24})', function(req, res) {
	User.get(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});