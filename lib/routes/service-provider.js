var express = require('express'),
	ServiceProvider = require('../ServiceProvider'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
	ServiceProvider.getServiceProviders(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/select/:id?', function(req, res) {
	ServiceProvider.selectServiceProvider(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.delete('/:id?', function(req, res) {
	ServiceProvider.removeServiceProvider(req, function(ret) {
		res.end();
	});
});

app.put('/:id?', function(req, res) {
	ServiceProvider.updateServiceProvider(req, function(ret) {
		res.end();
	});
});

app.post('/', function(req, res) {
	ServiceProvider.addServiceProvider(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});