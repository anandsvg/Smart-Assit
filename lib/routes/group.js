var express = require('express'),
	Group = require('../Group'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.post('/', function(req, res) {
	Group.addGroup(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.delete('/:id?', function(req, res) {
	Group.removeGroup(req, function(ret) {
		res.end();
	});
});

app.put('/:id?', function(req, res) {
	Group.updateGroup(req, function(ret) {
		res.end();
	});
});

app.get('/list', function(req, res) {
	Group.getGroups(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});