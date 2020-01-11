const multer = require('multer');
const config = require('../config/config.json');
const fs = require('fs');
const uid = require('rand-token').uid;
const merge = require('easy-pdf-merge');
const path = require('path');
const { uploadServiceRec } = require('../utils/upload.js');
const fileHandler = require('../utils/upload.js');
const format = require('date-format');

const tmpUploadDir = config.upload_dir;

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = path.join(tmpUploadDir,req.body.empId);
		if(!fs.existsSync(dest)){
			fs.mkdirSync(dest);
		}
	  	cb(null, dest);
	},
	filename: function (req, file, cb) {
		cb(null, req.body.empId+'_SRUpdate'+'_'+Date.now()+path.extname(file.originalname));	
	}
});
const tmpUpload = multer({ storage : storage});

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
		let query = "SELECT * FROM `employee` WHERE employeeId ='" + empId + "' ";
		db.query(query, function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500);
				res.render('updateServiceRecord' ,{message: {"errorMessage":"Error while fetching employee record"} });
			}else{
				if(result[0] !== undefined){
					var recordTypes = ['Pension','Promotion','Leave','Other'];
					var jsonObj = JSON.parse(JSON.stringify(result[0]));
					jsonObj['recordTypes'] = recordTypes;				
					res.status(200).send(jsonObj);
				}else{
					console.log('Employee record does not exist');
					//res.status(401).render('updateServiceRecord' ,{message: {"successMessage":"Employee id does not exist"} });
				}
			}
			res.end();
		});    
	});

	// create a service record
	app.post('/api/employees', uploadServiceRec.single('serviceRec'), function(req, res) {
		let empName = req.body.empName;
		let empId = req.body.empId;	
		try{		
			// inserting the data into database 
			let query = "INSERT INTO `employee` (employeeId, employeeName) VALUES (?,?)";
			db.query(query, [empId, empName], function (err, result) {
				if(err) {
					console.log("error: ", err);
					res.status(500).render('index' ,{message: {"errorMessage":"Error while adding record"}});	
				}else{	
					res.status(200).render('index' ,{message: {"successMessage":"Record added successfully"}});								
				}
			});	 
		}catch(err){
			console.log(err.sqlMessage);
			res.status(500);
			res.render('index' ,{message: {"errorMessage":"Error while adding record"}});
		}
	});
		
	// add a record in exisitng service record
	app.put('/api/employees',  tmpUpload.single('appendServiceRec'), function(req, res) {
		// delete from the database		
		let empId = req.body.empId;
		let recordType = req.body.recordType;
		let comment = req.body.comment;
		// generate a token
		var token = uid(16);
		// make an entry in database		
		let query = "INSERT INTO `recordhistory` (recordType, tokenNumber, comment, createTimestamp, createdBy, employeeId) VALUES (?,?,?,?,?,?)";
		db.query(query, [recordType, token, comment, format('dd-MM-yyyy hh.mm.ss',new Date()), '', empId], function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500);
				res.render('updateServiceRecord' ,{message: {"errorMessage":"Error while updating service record"} });
			}else{
				process(req, res, token);								
			}
			
		}); 
		
	});
	
}

async function process(req,res, token){
	try{
		let empId = req.body.empId;
		var dest = path.join(tmpUploadDir,empId,empId+'_SR.pdf');
		await fileHandler.downloadServiceRec(dest, empId+'_SR.pdf' );
		mergeFiles(req);
		res.status(200);
		res.render('updateServiceRecord' ,{message: {"successMessage":"Record Updates successfully. Token Number is :: "+token}});
	}catch(err){
		console.log(err);
		res.status(500);
		res.render('updateServiceRecord' ,{message: {"errorMessage":"Error while updating service record"} });
	}
}

function mergeFiles(req){
	let empId = req.body.empId;
	var empServiceRecordFilePath = path.join(req.file.destination,empId+'_SR.pdf');
	var source_files = [empServiceRecordFilePath, req.file.path];				
	merge(source_files,empServiceRecordFilePath,async function(err){
		if(err) {
			return console.log(err)
		}
		// upload back the service record
		var message = await fileHandler.uploadFile(empServiceRecordFilePath,empId+'_SR.pdf');
		console.log(message);
		// remove the merged record
		fs.unlinkSync(empServiceRecordFilePath);
		// keep the tmp directory in local dir		
	});
}
