var express = require('express');
flash = require('connect-flash'),
	require('./db/mongoose')
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
var path = require('path');
var fs = require('fs');
const methodOverride = require('method-override');
var morgan = require('morgan');
var logger = require('./config/winston');
var session = require('express-session');
var cookieParser = require('cookie-parser');



// var serviceRecordController = require('./controllers/serviceRecordController');
// var empController = require('./controllers/empController');

var serviceRecordController = require('./controllers/serviceRecController');
var empController = require('./controllers/employeeController');
var fileRoute = require('./routes/file.route');
var userRoute = require('./routes/user.route');
var authRoute = require('./routes/auth.route');

var port = process.env.PORT || 8080;
app.use(session({
	cookie: { maxAge: 60000 },
	secret: 'woot',
	resave: false,
	saveUninitialized: false
}));
app.use(cookieParser());
app.use(flash());
app.use(morgan('short', { stream: logger.stream }));
app.use('/assets', express.static(__dirname + '/public'));
app.use(express.static("public"));
app.set('view engine', 'ejs');
//app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method", {
	methods: ["POST", "GET"]
}));

app.use(function (req, res, next) {
	res.locals.success = req.flash('success');
	res.locals.errors = req.flash('error');
	next();
});

var logDirectory = path.join(__dirname, "logs");
// ensure log directory exists
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: "1qaz!QAZ",
	database: "srmgmt"
});

db.connect((err) => {
	if (err) {
		throw err;
	}
	console.log('Connected to MYSQL database');
});

global.db = db;

//error handling for invalid url
/**
app.use((req, res, next) => {
	const error = new Error('Not found.');
	res.status(404);
	next();
});

// to handle above error as well as well as error comes with in the application
app.use((error,req,res,next) => {
	res.status(error.status || 500);
	res.json({
		error:{
			message : error.message
		}
	});
});
 */

// empController(app);

// serviceRecordController(app);


// app.use(function (req, res, next) {
// 	console.log('callled !!!!!!!!!!', req.session.username, req.session.roles);
// 	res.locals.username = req.session.username;
// 	res.locals.roles = req.session.roles;
// 	next();
// });

fileRoute(app);

userRoute(app);

authRoute(app);

// app.use(function (err, req, res, next) {
// 	console.log('callled !!!!!!!!!!', req.session.username, err)
// 	res.locals.username = req.session.username;
// 	next();
// });

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// added this line to include winston logging
	logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);

	// render the error page
	res.status(err.status || 500);
	res.render('Internal server error.');
});

app.listen(port);