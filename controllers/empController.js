const multer = require('multer');
const config = require('../config/config.json');
const fs = require('fs');
const uid = require('rand-token').uid;
const path = require('path');
const ftpoperation = require('../utils/ftpoperation.js');
const format = require('date-format');

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
			filename = req.body.empId+'_SR'+'.'+file.originalname.split('.')[1];
	  		
		}else if(file.fieldname === 'appendServiceRec'){
			filename = req.body.empId+'_SRUpdate'+'_'+Date.now()+'.'+file.originalname.split('.')[1];
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
		try{		
			let query = "INSERT INTO `employee` (employeeId, employeeName) VALUES (?,?)";
			db.query(query, [empId, empName], function (err, result) {
				if(err) {
					console.log("error: ", err);
					res.status(500).render('index' ,{message: {"errorMessage":"Error while adding record"}});	
				}else{	
					//save into ftp server
					try{
						const promise = ftpoperation.uploadFtp(req,empId);
						promise.then(function(isSuccess) {						
							if(isSuccess){ 
								res.status(200).render('index' ,{message: {"successMessage":"Record added successfully."}});
							}
						});						
					}catch(err){
						// remove entry from db
						console.log(err);
						let query = "DELETE FROM `employee` WHERE employeeId = ?";
						db.query(query, [empId], function (error, result) {
							if(error){
								console.log('unable to rollback for employee id :'+empId);
							}
						});
						res.status(500).render('index' ,{message: {"errorMessage":"Error while FTP record"}});
					}
					//removeDir(req);												
				}				
			});	
			

		}catch(err){
			console.log(err);
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
				try{
					const promise = ftpoperation.uploadFtp(req,empId);
					promise.then(function(isSuccess) {						
						if(isSuccess){ 
							res.status(200).render('updateServiceRecord' ,{message: {"successMessage":"Record updated successfully. Token Number is :: "+token}});
						}
					});
				}catch(err){
					res.status(500).render('updateServiceRecord' ,{message: {"errorMessage":"Error while FTP record"}});
				}
				//TODO:: remove temporary dir and now merging will happen while downloading the files			
			}	
		}); 	
	});

	function removeDir(req){
		fs.unlink(req.file.path, function(){
			//remove directory now
			fs.rmdirSync(path.dirname(req.file.path));
		});
	}
}