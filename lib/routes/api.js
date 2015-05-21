var express = require('express'),
	Api = require('../Api'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

/*
ACTION: An action will 

REQUEST

EVENT

NOTIFICATION
*/

app.post('/questionnaire/input', function(req, res) {
	Api.submitQuestionnaireData(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send('{status:1}');
	});
});

app.get('/questionnaire/:id([0-9a-f]{24})', function(req, res) {
	Api.getQuestionnaireData(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.post('/action', function(req, res) {
	Api.invokeAction(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/active/:id([0-9a-f]{24})', function(req, res) {
	Api.updateActive(req, function(ret) {
		res.statusCode = 200;
		res.send();
	});
});