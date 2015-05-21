var _ = require('underscore'),
	fs = require('fs'),
	http = require('http'),
	express = require('express'),
	mongoConfig = require('./config/mongodb.json'),
	mongoStore = require('connect-mongo')(express),
	exphbs = require('express3-handlebars'),
	app = express();

console.log('Starting: ' + new Date().toString());
app.use(express.errorHandler());

process.on('uncaughtException', function(err) {
	var stamp;
	stamp = new Date();
	console.log("***************************** Exception Caught, " + stamp);
	console.log(err.stack);
	return console.log("Exception is:", err);
});

global.DOMAIN_NAME = 'smartassist.kopeltechdev.com';
global.NAME_FROM = 'Anandh';
global.EMAIL_FROM = 'noreply@pickzy.com';
global.TITLE = 'Simpl Assist';
global.SITE_NAME = 'Simpl Assist';
var logFile = fs.createWriteStream('./access.log', {
    flags: 'a'
});
app.use(express.cookieParser());
app.use(express.session({
	key: 'smart-assist',
	secret: 'asdaw#$#$ffg2ggdfg%',
	cookie: {
		path: '/',
		httpOnly: true
		//maxAge: 86400 * 30 * 1000
	},
	store: new mongoStore({
		host: mongoConfig.host,
		port: mongoConfig.port,
		username: mongoConfig.username,
		password: mongoConfig.password,
		db: mongoConfig.database
	})
}));

app.use(function(req, res, next) {
	var isSiteLogin = new RegExp(DOMAIN_NAME, 'gi').test(req.headers.referer);
    console.log("req.headers.referer");

	if (!isSiteLogin) {
		res.header('Access-Control-Allow-Credentials', true);
		res.header('Access-Control-Allow-Origin', req.headers.origin);
		res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
		res.header('Access-Control-Allow-Headers', 'Content-Type,Accept,X-Requested-With');

		if (req.method != 'OPTIONS') return next();

		res.send(204);
	} else {
		next();
	}
});

app.set('views', __dirname + '/views');

app.engine('handlebars', exphbs({
	partialsDir: __dirname + '/views/partials/',
	layoutsDir: __dirname + '/views/layouts/',
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(function(req, res, next) {
	// API
	app.use('/api', require(__dirname + '/lib/routes/api'));
	// USER LOGGED IN
	if (req.session.user) {
		if (_.indexOf(['admin', 'siteAdmin'], req.session.userType) > -1) {
			app.use('/service-provider', require(__dirname + '/lib/routes/service-provider'));
			app.use('/group', require(__dirname + '/lib/routes/group'));
			app.use('/questionnaire', require(__dirname + '/lib/routes/questionnaire'));
			app.use('/action', require(__dirname + '/lib/routes/action'));
			app.use('/event', require(__dirname + '/lib/routes/event'));

			var index = (req.session.userType == 'siteAdmin') ? 'siteAdmin/main' : 'admin/main';
		} else {
			// SHOULDNT HAPPEN
			console.log('not an admin');
		}
	}
	// USER NOT LOGGED IN
	else if (!req.session.user) {
		var index = 'login';
	}

	// ALL

    app.use('/user', require(__dirname + '/lib/routes/user'));

    app.use('/account', require(__dirname + '/lib/routes/account'));
    app.use('/simplnotification',require(__dirname+'/lib/routes/simplnotification'))
	if (index) {
		if (req.originalUrl == '/') {
			fs.readFile(__dirname + '/pub/views/' + index + '.html', function(err, html) {
				if (err) {
					throw err;
				}

				res.writeHeader(200, {
					"Content-Type": "text/html"
				});
				res.write(html);
				res.end();
			});
		} else if (/^\/views/.test(req.originalUrl)) {
			res.render(req.originalUrl.replace('/views/', ''));
		} else {
			next();
		}
	} else {
		next();
	}

});

app.use(express.static(__dirname + '/pub'));


app.listen(80);