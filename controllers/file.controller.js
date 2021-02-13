const config = require('../config/config.js');
const utility = require('../config/utility.js');
const format = require('date-format');
var logger = require('../config/winston');
const FileRecord = require('../models/file_record');
const FileStatus = require('../models/file_status');
const Designation = require('../models/designation_mapping');
const RevAlloc = require('../models/revenue_allocation');
const User = require('../models/user');

// fetch employee detail based on employee id
exports.getFileRecord = async function (req, res) {

	FileRecord.findOne({ uid: req.params.fileId })
		.populate('status')
		.populate('createdBy')
		.then(function (db_record) {
			// If we were able to successfully find an Product with the given id, send it back to the client
			let status_arr = db_record.status;
			let status_track_arr = [];
			status_arr.forEach((item, i) => {
				if (i === 0) {
					status_track_arr.push('File is saved on :' + item.createdOn);
				} else {
					status_track_arr.push('File status is changed from ' + status_arr[i - 1].status + ' to ' + item.status + ' on ' + item.createdOn);
				}
			});
			//console.log(status_track_arr + '################');
			res.status(200).send(db_record);
		})
		.catch(function (err) {
			// If an error occurred, send it to the client
			res.status(500).send({ msg: "Error while fetching file record" });
		});
};

// fetch employee detail based on employee id
exports.getFileRecordForUpdate = async function (req, res) {

	FileRecord.findOne({ uid: req.params.fileId })
		.populate('status')
		.then(function (db_record) {
			// If we were able to successfully find an Product with the given id, send it back to the client
			res.status(200).render('updateRecord', { record: db_record });
		})
		.catch(function (err) {
			// If an error occurred, send it to the client
			res.status(500).render('updateRecord', { message: "Error while fetching file record" });
		});
};

// fetch employee detail based on employee id
exports.getAllFiles = async function (req, res) {
	let query = {};
	User.findById(req.userId).populate('roles').exec(async (err, db_user) => {
		if (err) {
			res.status(500).render('file_view', { message: "Error while fetching file record" });
			return;
		}
		//admin can see all files
		//fx user can only see those files having prepared by reportee users
		//user can only see those files created by him
		if (db_user.roles.find(elem => elem.name === 'admin')) {
			query = {}
		} else if (db_user.roles.find(elem => elem.name === 'fx')) {
			let designation_ids = await Designation.findUserDesignationIds(db_user.designation);
			//find users having these designations
			let user_ids = await User.findByDesingations(designation_ids);
			query = { createdBy: { $in: user_ids } };
		} else {
			query = { createdBy: db_user._id };
		}
		let rev_allocations = await RevAlloc.find().lean();
		let fund_types = Array.from(new Set(rev_allocations.map(obj => obj.head_code)));
		FileRecord.find(query).populate('status')
			.populate({
				path: 'createdBy',
				populate: {
					path: 'designation'
				}
			})
			.then(function (db_records) {
				//iterate over db records and find and add current status and next status value
				db_records.forEach((item) => {
					let currStatus = item.status[item.status.length - 1].status;
					let nextActions = findNextActions(currStatus, db_user);
					item.currStatus = currStatus;
					item.nextActions = nextActions;
				})
				// If we were able to successfully find an Product with the given id, send it back to the client
				//res.status(200).send(db_records);
				let currentYear = new Date().getFullYear();
				res.status(200).render('file_view', {
					table: db_records, categories: config.file_categories
					, years: utility.getLastThreeFinancialYears(), status: Object.keys(config.file_status)
					, page: 'file_mgmt', fundTypes: fund_types, allocations: config.allocations
					, rev_allocations: rev_allocations
					, user: req.user, roles: req.roles
				})
			})
			.catch(function (err) {
				// If an error occurred, send it to the client
				res.status(500).render('file_view', { message: "Error while fetching file record" });
			});
	});
};

// het sub heads
exports.getSubheads = async function (req, res) {
	let head_code = req.params.head_code;
	let subheads = await RevAlloc.find({ 'head_code': head_code }, 'sub_head_code -_id').lean();
	subheads = subheads.map(obj => obj.sub_head_code);
	res.status(200).send(subheads);
};

function findNextActions(currStatus, db_user) {
	let user_roles = db_user.roles.map(elem => elem.name);
	return config.action_status_map_arr.filter((item) => (currStatus === item.curr_status && user_roles.includes(item.scope))).map(item => item.action);
}

// delete a file record
exports.deleteFileRecord = async function (req, res) {
	FileRecord.findOneAndDelete({ uid: req.body.uid }, (err, db_record) => {
		if (err) {
			res.status(500).render('addRecord', { message: err });
			return;
		}
		if (db_record) {
			let status_id_arr = db_record.status.filter((item) => item._id);
			FileStatus.deleteMany({ _id: { $in: status_id_arr } }, (err) => {
				if (err) {
					res.status(500).render('addRecord', { message: err });
					return;
				}
				//update user record and add back the allocated amount of the file
				let db_user = req.user;
				let allocated_amount = db_record.amount;
				let financialYear = db_record.financialYear;
				let report = db_user.reports.find((report) => report.financial_year === financialYear);
				report.available_amount += allocated_amount;
				report.consumed_amount -= allocated_amount;
				db_user.save((err, db_record) => {
					if (err) {
						res.status(500).render('addRecord', { message: err });
						return;
					}
					res.redirect('/tracker');
				});
			});
		} else {
			res.status(400).send({ message: 'record does not exist !!' });
		}
	});
};

// create a file record
exports.createFileRecord = async function (req, res) {
	// save status first and then file record
	console.log(req.user, 'creta file!!!!!!!!@@@@@@@');
	const fileStatus = new FileStatus({ status: config.file_status.FILE_RECORD_SAVED, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	fileStatus.save(async (err, db_status) => {
		if (err) {
			res.status(500).render('addRecord', { message: err });
			return;
		}
		let db_user = await User.findById(req.userId).populate('designation');
		//find desingation object of FX user to find count
		let db_desgn = await Designation.findOneAndUpdate({ designation: db_user.designation.mappedTo }, { $inc: { fileCount: 1 } });
		// desing unique file id based on the user designation mapped to which FX
		let num = ++db_desgn.fileCount
		const uniqueFileId = db_user.designation.mappedTo.replace('-', '') + num.toString().padStart(4, "0");
		let additionalObj = { uid: uniqueFileId, createdBy: db_user._id, createTimestamp: format('dd-MM-yyyy hh.mm.ss', new Date()), status: db_status._id };
		const file_record = new FileRecord({ ...req.body, ...additionalObj });
		file_record.save((err, db_record) => {
			if (err) {
				res.status(500).render('addRecord', { message: err });
				return;
			}
			// update user data reports value
			let financialYear = req.body.financialYear;
			let amount = parseInt(req.body.amount);
			let db_user = req.user;
			let report = db_user.reports.find((report) => report.financial_year === financialYear);
			report.available_amount -= amount;
			report.consumed_amount += amount;
			db_user.save((err, db_record) => {
				if (err) {
					res.status(500).render('addRecord', { message: err });
					return;
				}
				res.redirect('/tracker');
			});
		});
	});
};

// update by admin
exports.updateFileRecord = async function (req, res) {
	let { uid, ...body } = req.body;
	FileRecord.findOneAndUpdate({ uid: uid }, body, (err, db_record) => {
		if (err) {
			req.flash('error', 'Error while updating record !');
			res.redirect('/tracker');
			return;
		}
		// update user records data as well, incase the file amount is changed
		let db_user = req.user;
		let prev_allocated_amount = db_record.amount;
		let curr_allocated_amount = parseInt(req.body.amount);
		let financialYear = db_record.financialYear;
		let report = db_user.reports.find((report) => report.financial_year === financialYear);
		//remove the previously allocated amount
		report.available_amount += prev_allocated_amount;
		report.consumed_amount -= prev_allocated_amount;
		//add up the current allocated amount
		report.available_amount -= curr_allocated_amount;
		report.consumed_amount += curr_allocated_amount;
		db_user.save((err, db_record) => {
			if (err) {
				req.flash('error', 'Error while updating record !');
			}
			res.redirect('/tracker');
		});
	});
}

// update by admin
exports.updateFileRecordStatus = async function (req, res) {
	// delete from the database
	let inputfileId = req.body.uid;
	let action = req.body.action;
	let status_to_be_added = config.action_status_map_arr.find((item) => (action === item.action)).new_status;
	let fileStatus = new FileStatus({ status: status_to_be_added, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) })
	// add status and then update file record
	fileStatus.save((err, db_status) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		const filter = { uid: inputfileId };
		const update = { $push: { status: db_status._id } };
		FileRecord.findOneAndUpdate(filter, update, { new: true }, (err, db_record) => {
			if (err) {
				res.status(500).send({ message: err });
				return;
			}
			res.redirect('/tracker');
		});
	});
}

// update by admin
exports.approveFileRecordStatus = async function (req, res) {
	// delete from the database
	let inputfileId = req.body.uid;
	let action = req.body.action;
	let status_to_be_added = config.action_status_map_arr.find((item) => (action === item.action)).new_status;
	let fileStatus = new FileStatus({ status: status_to_be_added, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) })
	// add status and then update file record
	fileStatus.save((err, db_status) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		const filter = { uid: inputfileId };
		const update = { $push: { status: db_status._id }, vettedAmount: req.body.vettedAmount, message: req.body.message };
		FileRecord.findOneAndUpdate(filter, update, { new: true }, (err, db_record) => {
			if (err) {
				res.status(500).send({ message: err });
				return;
			}
			res.redirect('/tracker');
		});
	});
}

// update by admin
exports.returnFileRecordStatus = async function (req, res) {
	// delete from the database
	let inputfileId = req.body.uid;
	let action = req.body.action;
	let status_to_be_added = config.action_status_map_arr.find((item) => (action === item.action)).new_status;
	let fileStatus = new FileStatus({ status: status_to_be_added, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) })
	// add status and then update file record
	fileStatus.save((err, db_status) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		const filter = { uid: inputfileId };
		const update = { $push: { status: db_status._id }, message: req.body.message };
		FileRecord.findOneAndUpdate(filter, update, { new: true }, (err, db_record) => {
			if (err) {
				res.status(500).send({ message: err });
				return;
			}
			res.redirect('/tracker');
		});
	});
}