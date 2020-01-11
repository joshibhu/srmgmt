var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
const methodOverride = require('method-override');
var morgan = require('morgan');

var serviceRecordController = require('./controllers/serviceRecordController');
var empController = require('./controllers/empController');

var port = process.env.PORT || 3000;


app.use(morgan('dev'));
app.use('/assets', express.static(__dirname + '/public'));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json()); 

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: "1qaz!QAZ",
	database: "srmgmt"
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
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
empController(app);

serviceRecordController(app);

app.listen(port);