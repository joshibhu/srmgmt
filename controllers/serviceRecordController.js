const fs = require('fs');
const config = require('../config/config.json');
const fileDir = 'C:/Bhuwan/Learning/ServiceRecordMgmt/uploads/';
const path = require('path');
const fileHandler = require('../utils/upload.js');

const tmpUploadDir = config.upload_dir;

module.exports = function(app) {

	//fetch all details of employee table
	app.get('/api/servicerecords/viewAll', function(req, res) {
		// get that data from database
		let query = "SELECT * FROM `employee` ";
		db.query(query, function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500).send(err);
			}else{
				console.log(result);
				var jsonObj = JSON.parse(JSON.stringify(result));	
				res.status(200).send(jsonObj);
			}
			res.end();
		});    

	});
	
	// fetch employee detail based on employee id
	app.get('/api/servicerecords/view/:empId', function(req, res) {
		let empId =  req.params.empId;
		var filePath = path.join(fileDir, empId, empId+'_SR.pdf');
		console.log(filePath);
		fs.createReadStream(filePath).pipe(res);
	});

	app.post('/api/servicerecords/download/:empId', function(req, res) {
		let empId =  req.params.empId;
		if(empId !== undefined){
			process(res,empId); 
		}else{
			res.status(500);
			res.end();
		}
		
	});

	app.get('/api/servicerecords/history/:empId', function(req, res) {
		let empId =  req.params.empId;
		let query = "SELECT e.employeeId, e.employeeName, r.recordType, r.createTimestamp, r.tokenNumber, r.comment "
		+ " FROM `employee` e ,`recordhistory` r"
		+ " WHERE e.employeeId = r.employeeId AND e.employeeId = ?"
		+ " ORDER BY r.createTimestamp";
		db.query(query, [empId] ,function (err, result) { 
			if(err) {
				console.log("error: ", err);
				res.status(500).send(err);
			}else{	
				res.status(200).send(result);
			}
			res.end();
		});    
	});
	
	async function process(res, empId){
		console.log('came here!!');
		var filePath = path.join(tmpUploadDir,empId,empId+'_SR.pdf');
		var isExist = fs.existsSync(path.dirname(filePath));
		if(!isExist){
			fs.mkdirSync(path.dirname(filePath));
		}
		var awsRes = await fileHandler.downloadServiceRec(filePath, empId+'_SR.pdf' );
		if(awsRes === 'done'){
			res.setHeader('Content-disposition', 'attachment; filename='+empId+'_SR.pdf');
			res.set('Content-Type', 'text/pdf');
			fs.createReadStream(filePath).pipe(res);
		} 
	}
}