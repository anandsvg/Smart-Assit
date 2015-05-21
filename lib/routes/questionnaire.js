var express = require('express'),
	questionnaires = require('../Questionnaire'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

app.get('/', function(req, res) {
	questionnaires.getQuestionnaires(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/group/:id?', function(req, res) {
	questionnaires.getQuestionnaireGroup(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/:id?', function(req, res) {
	questionnaires.getQuestionnaire(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.delete('/:id?', function(req, res) {
	questionnaires.removeQuestionnaire(req, function(ret) {
		res.end();
	});
});

app.put('/:id?', function(req, res) {
	questionnaires.updateQuestionnaire(req, function(ret) {
		res.end();
	});
});

app.post('/', function(req, res) {
	questionnaires.addQuestionnaire(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});