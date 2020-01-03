var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var mysql = require('mysql');
const methodOverride = require('method-override');
var serviceRecordController = require('./controllers/serviceRecordController');
var empController = require('./controllers/empController');

var port = process.env.PORT || 3000;

app.use('/assets', express.static(__dirname + '/public'));
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: "nj121296",
	database: "srmgmt"
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;

empController(app);

serviceRecordController(app);

app.listen(port);