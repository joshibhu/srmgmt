const multer = require('multer');
const config = require('../config/config.json');
const fs = require('fs');
const uid = require('rand-token').uid;
const path = require('path');
const format = require('date-format');
var logger = require('../config/winston');

const tmpUploadDir = config.upload_dir;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = path.join(tmpUploadDir,req.body.empId);
		if(!fs.existsSync(dest)){
			fs.mkdirSync(dest,{ recursive: true });
		}
	  	cb(null, dest);
	},
	filename: function (req, file, cb) {
		var filename;
		if(file.fieldname === 'serviceRec'){
			filename = req.body.empId+'_SRInitial'+'.'+file.originalname.split('.')[1];
	  		
		}else if(file.fieldname === 'appendServiceRec'){
			filename = req.body.empId+'_SRUpdate'+'_'+format('MMddyyyy_hhmmss',new Date())+'.'+file.originalname.split('.')[1];
		}
		cb(null, filename);
		
	}
});
const upload = multer({ storage : storage});

module.exports = function(app) {
	
	app.get('/',function(req,res){
		res.render('index' ,{message: {} });
	});

	app.get('/serviceRecordHistory',function(req,res){
		res.render('serviceRecordHistory' ,{message: {} });
	});

	app.get('/updateServiceRecord',function(req,res){
		res.render('updateServiceRecord' ,{message: {} });
	});

	app.get('/viewAllRecord',function(req,res){
		res.render('viewAllRecord' ,{message: {} });
	});

	// fetch employee detail based on employee id
	app.get('/api/employees/:id', function(req, res) {
	// get that data from database
		let empId =  req.params.id;
		logger.info('Fetching employee record for ::%s',empId);
		let query = "SELECT * FROM `employee` WHERE employeeId ='" + empId + "' ";
		db.query(query, function (err, result) { 
			if(err) {
				logger.error("error: ", err);
				res.status(500);
				res.render('updateServiceRecord' ,{message: {"errorMessage":"Error while fetching employee record"} });
			}else{
				if(result[0] !== undefined){
					var recordTypes = ['Pension','Promotion','Leave','Other'];
					var jsonObj = JSON.parse(JSON.stringify(result[0]));
					jsonObj['recordTypes'] = recordTypes;				
					res.status(200).send(jsonObj);
				}else{
					logger.error('Employee record not found');
					res.status(401).render('updateServiceRecord' ,{message: {"successMessage":"Employee id does not exist"} });
				}
			}
			res.end();
		});    
	});

	// create a service record
	app.post('/api/employees', upload.single('serviceRec'), function(req, res) {
		let empName = req.body.empName;
		let empId = req.body.empId;	
		logger.info('Uploading service record for emp id ::%s and employee name ::%s', empId, empName);
		try{		
			let query = "INSERT INTO `employee` (employeeId, employeeName) VALUES (?,?)";
			db.query(query, [empId, empName], function (err, result) {
				if(err) {
					logger.error("error: ", err);
					res.status(500).render('index' ,{message: {"errorMessage":"Error while adding record"}});	
				}else{	
					logger.info('Employee service record saved and uploaded successfully!!');
					res.status(200).render('index' ,{message: {"successMessage":"Record added successfully."}});											
				}				
			});	
		}catch(err){
			logger.error('Error while uploading record',err);
			res.status(500);
			res.render('index' ,{message: {"errorMessage":"Error while adding record."}});
		}
	});
		
	// add a record in exisitng service record
	app.put('/api/employees',  upload.single('appendServiceRec'), function(req, res) {
		// delete from the database		
		let empId = req.body.empId;
		let recordType = req.body.recordType;
		let comment = req.body.comment;
		logger.info('Updating service record for emp id ::%s and record type ::%s', empId, recordType);
		// generate a token
		var token = uid(16);
		logger.info('Unique token generated is :: %s', token);
		// make an entry in database		
		let query = "INSERT INTO `recordhistory` (recordType, tokenNumber, comment, createTimestamp, createdBy, employeeId) VALUES (?,?,?,?,?,?)";
		db.query(query, [recordType, token, comment, format('dd-MM-yyyy hh.mm.ss',new Date()), '', empId], function (err, result) { 
			if(err) {
				logger.error("error: ", err);
				res.status(500);
				res.render('updateServiceRecord' ,{message: {"errorMessage":"Error while updating service record"} });
			}else{
				logger.info('Service record update is successfull.');
				res.status(200).render('updateServiceRecord' ,{message: {"successMessage":"Record updated successfully. Token Number is :: "+token}});	
			}	
		}); 	

	});

}