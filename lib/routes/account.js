var express = require('express'),
	Account = require('../Account'),
	app = module.exports = express();

app.use(express.urlencoded());
app.use(express.json());

// LOGIN
app.post('/login', function(req, res) {
	Account.login(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.post('/login-device', function(req, res) {
	Account.loginDevice(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// LOGOUT
app.get('/logout', function(req, res) {
	Account.logout(req, function(ret) {
		res.end();
	});
});

app.post('/logout-device', function(req, res) {
	Account.logoutDevice(req, function(ret) {
		res.end();
	});
});


// GET USER INFO
app.get('/get', function(req, res) {
	Account.get(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// GET ACTION QUESTIONS
app.get('/action/:id', function(req, res) {
	Account.getAction(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

// SERVICE PROVIDERS
app.get('/service-providers', function(req, res) {
	Account.getServiceProviders(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/service-provider/select/:id?', function(req, res) {
    console.log('servcie provider selection');
	Account.selectServiceProvider(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/user-profile', function(req, res) {
	Account.getUserProfile(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/activate/:token?', function(req, res) {
	Account.activate(req, function(ret) {
		res.setHeader('Content-Type', 'text/html');
		if (ret.status == 1) {
			res.statusCode = 200;
			res.write(ret.content);
			res.end();
		} else {
			res.statusCode = 302;
			res.setHeader('Location', '/');
			res.end();
		}
	});
});

app.get('/password/:token?', function(req, res) {
	Account.password(req, function(ret) {
		res.setHeader('Content-Type', 'text/html');
		if (ret.status == 1) {
			res.statusCode = 200;
			res.write(ret.content);
			res.end();
		} else {
			res.statusCode = 302;
			res.setHeader('Location', '/');
			res.end();
		}
	});
});

app.post('/forgot', function(req, res) {
	Account.forgotPassword(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.post('/password', function(req, res) {
	Account.setPassword(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});

app.get('/email/:token?', function(req, res) {
	Account.changeEmail(req, function(ret) {
		res.setHeader('Content-Type', 'text/html');
		if (ret.status == 1) {
			res.statusCode = 200;
			res.write(ret.content);
			res.end();
		} else {
			res.statusCode = 302;
			res.setHeader('Location', '/');
			res.end();
		}
	});
});

app.put('/your-account', function(req, res) {
	Account.updateYourAccount(req, function(ret) {
		res.setHeader('Content-Type', 'application/json');
		res.send(ret);
	});
});