const multer = require('multer');
const config = require('../config/config.js');
const fs = require('fs');
const uid = require('rand-token').uid;
const path = require('path');
const format = require('date-format');
var logger = require('../config/winston');
const Employee = require('../models/employee');
const RecordHistory = require('../models/recordHistory');

const tmpUploadDir = config.upload_dir;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = path.join(tmpUploadDir, req.body.empId);
		if (!fs.existsSync(dest)) {
			fs.mkdirSync(dest, { recursive: true });
		}
		cb(null, dest);
	},
	filename: function (req, file, cb) {
		var filename;
		if (file.fieldname === 'serviceRec') {
			filename = req.body.empId + '_SRInitial' + '.' + file.originalname.split('.')[1];

		} else if (file.fieldname === 'appendServiceRec') {
			filename = req.body.empId + '_SRUpdate' + '_' + format('MMddyyyy_hhmmss', new Date()) + '.' + file.originalname.split('.')[1];
		}
		cb(null, filename);

	}
});
const upload = multer({ storage: storage });

module.exports = function (app) {

	app.get('/', function (req, res) {
		res.render('index', { message: {} });
	});

	app.get('/serviceRecordHistory', function (req, res) {
		res.render('serviceRecordHistory', { message: {} });
	});

	app.get('/updateServiceRecord', function (req, res) {
		res.render('updateServiceRecord', { message: {} });
	});

	app.get('/viewAllRecord', function (req, res) {
		res.render('viewAllRecord', { message: {} });
	});

	// fetch employee detail based on employee id
	app.get('/api/employees/:id', async function (req, res) {
		try {
			const employee = await Employee.findByEmployeeId(req.params.id);
			var recordTypes = ['Pension', 'Promotion', 'Leave', 'Other'];
			var jsonObj = JSON.parse(JSON.stringify(employee));
			jsonObj['recordTypes'] = recordTypes;
			res.status(200).send(jsonObj);
		} catch (e) {
			logger.error('Employee record not found');
			res.status(401).render('updateServiceRecord', { message: { "successMessage": "Error while fetching employee record" } });
		}

		res.end();
	});

	// create a service record
	app.post('/api/employees', upload.single('serviceRec'), async function (req, res) {
		const employee = new Employee(req.body);
		let record = new RecordHistory({ recordType: 'Initial Entry', tokenNumber: uid(16), comment: 'First Entry', createTimestamp: format('dd-MM-yyyy hh.mm.ss', new Date()), createdBy: 'Admin', employeeId: req.body.empId });
		try {
			await employee.save();
			//make an initial entry in records table
			await record.save();
			logger.info('Employee service record saved and uploaded successfully!!');
			res.status(200).render('index', { message: { "successMessage": "Record added successfully." } });
		} catch (err) {
			logger.error("error: ", err);
			res.status(500).render('index', { message: { "errorMessage": "Error while adding record" } });
		}
	});

	// add a record in exisitng service record
	app.put('/api/employees', upload.single('appendServiceRec'), async function (req, res) {
		// delete from the database
		let empId = req.body.empId;
		let recordType = req.body.recordType;
		logger.info('Updating service record for emp id ::%s and record type ::%s', empId, recordType);
		// generate a token
		var token = uid(16);
		logger.info('Unique token generated is :: %s', token);
		req.body['tokenNumber'] = token;
		req.body['createTimestamp'] = format('dd-MM-yyyy hh.mm.ss', new Date());
		req.body['createdBy'] = 'Admin';
		const record = new RecordHistory(req.body)
		try {
			await record.save()
			logger.info('Service record update is successfull.');
			res.status(200).render('updateServiceRecord', { message: { "successMessage": "Record updated successfully. Token Number is :: " + token } });
		} catch (err) {
			logger.error("error: ", err);
			res.status(500);
			res.render('updateServiceRecord', { message: { "errorMessage": "Error while updating service record" } });
		}
	});
}