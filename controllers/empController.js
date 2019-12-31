const multer = require('multer');
const fs = require('fs');
const uid = require('rand-token').uid;
const merge = require('easy-pdf-merge');
const path = require('path');

const fileDir = 'C:/Bhuwan/Learning/ServiceRecordMgmt/uploads/';

var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		var dest = path.join(fileDir,req.body.empId);
		if(!fs.existsSync(dest)){
			fs.mkdirSync(dest);
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
	
	// fetch employee detail based on employee id
	app.get('/api/employees/:id', function(req, res) {
	// get that data from database
		let empId =  req.params.id;
		let query = "SELECT * FROM `employee` WHERE employeeId ='" + empId + "' ";
		db.query(query, function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500).send(err);
			}else{
				var recordTypes = ['Pension','Promotion','Leave','Other'];
				console.log(result[0]);
				var jsonObj = JSON.parse(JSON.stringify(result[0]));
				jsonObj['recordTypes'] = recordTypes;				
				res.status(200).send(jsonObj);
			}
			res.end();
		});    

	});

	// create a service record
	app.post('/api/employees', upload.single('serviceRec'), function(req, res) {
		let empName = req.body.empName;
		let empId = req.body.empId;				
		db.beginTransaction(function(err) {
			if (err) { throw err; }
			let query = "INSERT INTO `employee` (employeeId, employeeName) VALUES (?,?)";
			db.query(query, [empId, empName], function (error, results, fields) {
			  if (error) {
				return db.rollback(function() {
				  throw error;
				});
			  }			 
			  query = "INSERT INTO `servicerecord` SET ?";
			  db.query(query, {fileName:req.file.filename,createTimestamp:Date.now(),updateTimestamp:Date.now(),employeeId:empId}, function (error, results, fields) {
				if (error) {
				  return db.rollback(function() {
					throw error;
				  });
				}
				db.commit(function(err) {
				  if (err) {
					return db.rollback(function() {
					  throw err;
					});
				  }
				  res.status(200).send({succees: 'Added successfully'});
				  res.end();
				});
			  });
			 
			});
		  });		  
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
		db.query(query, [recordType, token, comment, Date.now(), '', empId], function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500).send(err);

			}else{
				res.status(200).send(token);		
				// merge the uploaded record to exisitng service record
				var empServiceRecordFilePath = path.join(req.file.destination,empId+'_SR.pdf');
				var source_files = [empServiceRecordFilePath, req.file.path];				
				merge(source_files,empServiceRecordFilePath,function(err){
					if(err) {
					  return console.log(err)
					}
					console.log('Success')
					// remove the uploaded file once merged
					fs.unlinkSync(req.file.path);
				});						
			}
			res.end();
		}); 
		
	});
	
}