const fs = require('fs');
const config = require('../config/config.js');
const path = require('path');
const merge = require('easy-pdf-merge');
var logger = require('../config/winston');
const Employee = require('../models/employee');
const RecordHistory = require('../models/recordHistory');
const tmpUploadDir = config.upload_dir;

module.exports = function(app) {

	//fetch all details of employee table
	app.get('/api/servicerecords/viewAll',async function(req, res) {
		// get that data from database
		try {
			const employees = await Employee.find({});		
			var jsonObj = JSON.parse(JSON.stringify(employees));	
			console.log(jsonObj);
			res.status(200).send(jsonObj);
		} catch (err) {
			logger.error("error: ", err);
			res.status(500).send(err);
		}
		res.end();
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
				}else{
					//listing all files using forEach
					let sourcefilearray = [];
					if(files.length === 1){
						logger.info('Only one file found hence no merging is performed !!');
						res.setHeader('Content-disposition', 'attachment; filename='+empId+'_SR.pdf');
						res.set('Content-Type', 'text/pdf');
						fs.createReadStream(path.join(sourcefilespath,files[0])).pipe(res);
					}else{
						files.forEach(function (file) {						
							sourcefilearray.push(path.join(sourcefilespath,file)); 
						});
						merge(sourcefilearray,destinationfilepath,function(err){						
							res.setHeader('Content-disposition', 'attachment; filename='+empId+'_Merged_SR.pdf');
							res.set('Content-Type', 'text/pdf');
							logger.info('All records merger into PDF is successfull.');
							fs.createReadStream(destinationfilepath).pipe(res);
							logger.info('Removing merged file !!');
							fs.unlinkSync(destinationfilepath);                    
						});
					}					
				}			
			});
		}else{
			logger.error('Employee id is missing!');
			res.status(401);
			res.end();
		}
	});

	app.get('/api/servicerecords/history/:empId',async function(req, res) {
		let empId =  req.params.empId;
		logger.info('Fething record history of empID ::%s',empId);
		try {
			const records = await RecordHistory.findByEmployeeId(empId);
			var jsonObj = JSON.parse(JSON.stringify(records));	
			console.log('######'+ jsonObj);
			res.status(200).send(jsonObj);
		} catch (err) {
			logger.error("error: ", err);
			res.status(500).send(err);
		}
		res.end();
	});


	function removeMergedFile(destinationfilepath){
		fs.unlinkSync(destinationfilepath);
		fs.unlink(req.file.path, function(){
			//remove directory now
			fs.rmdirSync(path.dirname(req.file.path));
		});
	}
}