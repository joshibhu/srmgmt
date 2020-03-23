const fs = require('fs');
const config = require('../config/config.json');
const path = require('path');
const merge = require('easy-pdf-merge');
var logger = require('../config/winston');
const tmpUploadDir = config.upload_dir;

module.exports = function(app) {

	//fetch all details of employee table
	app.get('/api/servicerecords/viewAll', function(req, res) {
		// get that data from database
		let query = "SELECT * FROM `employee` ";
		db.query(query, function (err, result) { 
			if(err) {
				logger.error("error: ", err);
				res.status(500).send(err);
			}else{
				logger.debug('Employee records in database::',result);
				var jsonObj = JSON.parse(JSON.stringify(result));	
				res.status(200).send(jsonObj);
			}
			res.end();
		});    

	});
	

	app.get('/api/servicerecords/download/:empId', function(req, res) {
		let empId =  req.params.empId;
		logger.info('Request to donwload service record for employee id ::%s',empId)
		if(empId !== undefined){
			//fetch all files, merge it and send the merged files
			let sourcefilespath = path.join(tmpUploadDir,empId);
			let destinationfilepath = path.join(tmpUploadDir,empId, empId+'_Merged_SR.pdf');
			logger.info('Source files dir::%s will be merged into a file having filepath ::%s',sourcefilespath,destinationfilepath)
			fs.readdir(sourcefilespath, function (err, files) {
				//handling error
				if (err) {
					logger.error('Error while reading source file dir. Hence rejecting.');
					reject(err);
				}else{
					//listing all files using forEach
					let sourcefilearray = [];
					files.forEach(function (file) {
						// Do whatever you want to do with the file
						sourcefilearray.push(path.join(tmpUploadDir,empId,file)); 
					});
					merge(sourcefilearray,destinationfilepath,function(err){
						if(err) {
							reject(err);
						}
						res.setHeader('Content-disposition', 'attachment; filename='+empId+'_Merged_SR.pdf');
						res.set('Content-Type', 'text/pdf');
						logger.info('All records merger into PDF is successfull.');
						fs.createReadStream(destinationfilepath).pipe(res);
						logger.info('Removing merged file !!');
						fs.unlinkSync(destinationfilepath);                    
					});
				}
			
			});
		}else{
			logger.error('Employee id is missing!');
			res.status(401);
			res.end();
		}
	});

	app.get('/api/servicerecords/history/:empId', function(req, res) {
		let empId =  req.params.empId;
		logger.info('Fething record history of empID ::%s',empId);
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


	function removeMergedFile(destinationfilepath){
		fs.unlinkSync(destinationfilepath);
		fs.unlink(req.file.path, function(){
			//remove directory now
			fs.rmdirSync(path.dirname(req.file.path));
		});
	}
}