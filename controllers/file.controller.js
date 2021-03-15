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
	let db_user = req.user;
	try {
		//admin can see all files
		//fx user can only see those files having prepared by reportee users
		//user can only see those files created by him
		if (db_user.roles.find(elem => elem.name === 'admin')) {
			query = {}
		} else if (db_user.roles.find(elem => elem.name === 'fx')) {
			let designation_ids = await Designation.findUserDesignationIds(db_user.designation._id);
			//find users having these designations
			let user_ids = await User.findByDesingations(designation_ids);
			query = { createdBy: { $in: user_ids } };
		} else {
			query = { createdBy: db_user._id };
		}
		let rev_allocations = await RevAlloc.find().lean();
		let fund_types = Array.from(new Set(rev_allocations.map(obj => obj.head_code)));

		let db_records = await FileRecord.find(query).populate('status')
			.populate({
				path: 'createdBy',
				populate: {
					path: 'designation'
				}
			});
		//iterate over db records and find and add current status and next status value
		db_records.forEach(async (item) => {
			let currStatus = item.status[item.status.length - 1].status;
			let nextActions = findNextActions(currStatus, db_user);
			item.currStatus = currStatus;
			item.nextActions = nextActions;
			item.createTimestamp = item.createTimestamp.split(' ')[0]
			item.onBehalfOf = (item.onBehalfOf === 'self') ? item.onBehalfOf : (await User.findById(item.onBehalfOf).lean()).name;
		})
		//list special users
		let special_users = await User.findSpecialUsers();
		res.status(200).render('file_view', {
			table: db_records, categories: config.file_categories
			, years: utility.getLastThreeFinancialYears(), status: Object.keys(config.file_status)
			, page: 'file_mgmt', fundTypes: fund_types, allocations: config.allocations
			, rev_allocations: rev_allocations
			, user: req.user
			, roles: req.roles
			, special_users: special_users
		})
	} catch (err) {
		// If an error occurred, send it to the client
		console.error(err);
		res.status(500).render('file_view', { message: "Error while fetching file record" });
	}
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
	let onBehalfOfUserId = req.body.onBehalfOfUserId;
	let db_accounted_user;
	try {
		//delete file record and fetch the details
		let db_record = await FileRecord.findOneAndDelete({ uid: req.body.uid });
		let status_id_arr = db_record.status.filter((item) => item._id);
		//delete all status related to file
		await FileStatus.deleteMany({ _id: { $in: status_id_arr } });
		let allocated_amount = db_record.amount;
		let financialYear = db_record.financialYear;
		let onbehalfOf_id = db_record.onBehalfOf;
		//update user record and add back the allocated amount of the file
		if (onbehalfOf_id === 'self') {
			//SELF account was used
			db_accounted_user = req.user;
		} else {
			//others account was used
			db_accounted_user = await User.findById(onbehalfOf_id);
		}
		let report = db_accounted_user.reports.find((report) => report.financial_year === financialYear);
		report.consumed_amount -= allocated_amount;
		await db_accounted_user.save();
		res.redirect('/tracker');
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: 'error while deleting file record !!' });
	}
};

// create a file record
exports.createFileRecord = async function (req, res) {
	try {
		// save status first and then file record
		const fileStatus = new FileStatus({ status: config.file_status.FILE_RECORD_SAVED, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
		fileStatus.save(async (err, db_status) => {
			if (err) {
				res.status(500).render('addRecord', { message: err });
				return;
			}
			//let db_user = await User.findById(req.userId).populate('designation');
			let db_user = req.user;
			//find desingation object of FX user to find count
			let db_desgn = await Designation.findOneAndUpdate({ designation: db_user.designation.mappedTo }, { $inc: { fileCount: 1 } });
			// desing unique file id based on the user designation mapped to which FX
			let num = ++db_desgn.fileCount
			const uniqueFileId = db_user.designation.mappedTo.replace('-', '') + num.toString().padStart(4, "0");
			let additionalObj = { uid: uniqueFileId, createdBy: db_user._id, createTimestamp: format('dd-MM-yyyy hh.mm.ss', new Date()), status: db_status._id };
			const file_record = new FileRecord({ ...req.body, ...additionalObj });
			file_record.save(async (err, db_record) => {
				if (err) {
					console.error(err);
					req.flash('error', 'Error while creating record !');
					res.redirect('/tracker');
					return;
				}
				// update user data reports value
				let financialYear = req.body.financialYear;
				let amount = parseInt(req.body.amount);
				let db_accounted_user;
				if (req.body.onBehalfOf === 'self') {
					db_accounted_user = req.user;
				} else {
					db_accounted_user = await User.findById(req.body.onBehalfOf);
				}
				let report = db_accounted_user.reports.find((report) => report.financial_year === financialYear);
				report.consumed_amount += amount;
				await db_accounted_user.save();
				res.redirect('/tracker');
			});
		});
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: 'error while creating file record !!' });
	}
};

// update by admin
exports.updateFileRecord = async function (req, res) {
	let { uid, ...body } = req.body;
	FileRecord.findOneAndUpdate({ uid: uid }, body, async (err, db_record) => {
		if (err) {
			console.error(err);
			req.flash('error', 'Error while updating record !');
			res.redirect('/tracker');
			return;
		}
		// update user records data as well, incase the file amount is changed
		let prev_allocated_amount = db_record.amount;
		let curr_allocated_amount = parseInt(req.body.amount);

		let db_accounted_user;
		let db_accounted_prev_user;
		if (req.body.onBehalfOf === 'self') {
			db_accounted_user = req.user;
		} else {
			db_accounted_user = await User.findById(req.body.onBehalfOf);
		}
		//if onbehalfof user itself is changed
		if (req.body.onBehalfOf !== db_record.onBehalfOf) {
			// remove the prev allocated amount from previous user account
			if (db_record.onBehalfOf === 'self') {
				//if it was SELF
				db_accounted_prev_user = req.user;
			} else {
				//if it was some one else
				db_accounted_prev_user = await User.findById(db_record.onBehalfOf);
			}
			let prev_user_report = db_accounted_prev_user.reports.find((report) => report.financial_year === db_record.financialYear);
			prev_user_report.consumed_amount -= prev_allocated_amount;
			await db_accounted_prev_user.save();
			// add the new amount in the new/selected user account
			let report = db_accounted_user.reports.find((report) => report.financial_year === req.body.financialYear);
			report.consumed_amount += curr_allocated_amount;
		} else {
			// if the user is same but financial year and amount may different
			if (db_record.financialYear === req.body.financialYear) {
				//for the same financial year, prev consumed amount should be removed and new one should be added
				let report = db_accounted_user.reports.find((report) => report.financial_year === db_record.financialYear);
				report.consumed_amount -= prev_allocated_amount;
				report.consumed_amount += curr_allocated_amount;
			} else if (db_record.financialYear !== req.body.financialYear) {
				//for different financial year, prev consumed amount should be removed from that financial year
				//and new one should be added into new financila year status
				let existing_finyear_report = db_accounted_user.reports.find((report) => report.financial_year === db_record.financialYear);
				existing_finyear_report.consumed_amount -= prev_allocated_amount;
				let latest_finyear_report = db_accounted_user.reports.find((report) => report.financial_year === req.body.financialYear);
				latest_finyear_report.consumed_amount += curr_allocated_amount;
			}
		}

		await db_accounted_user.save();
		res.redirect('/tracker');
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
	try {
		let inputfileId = req.body.uid;
		let action = req.body.action;
		let status_to_be_added = config.action_status_map_arr.find((item) => (action === item.action)).new_status;
		let fileStatus = new FileStatus({ status: status_to_be_added, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) })
		// add status and then update file record
		let db_status = await fileStatus.save();
		const filter = { uid: inputfileId };
		const update = { $push: { status: db_status._id }, vettedAmount: req.body.vettedAmount, message: req.body.message };
		let db_file_record = await FileRecord.findOneAndUpdate(filter, update);

		//the vetted amount is the approved amount
		//it may be lesser than the applied file amount
		//and hence it should be adjusted with the consumed amount of the user calculated earlier
		let approvedAmount = req.body.vettedAmount;
		let appliedAMount = db_file_record.amount;
		let userId;
		//find the user whose account is used
		if (db_file_record.onBehalfOf === 'self') {
			userId = db_file_record.createdBy;
		} else {
			userId = db_file_record.onBehalfOf;
		}
		//find financial year
		let fin_year = db_file_record.financialYear;
		// find user from db
		let db_user = await User.findById(userId);
		let report = db_user.reports.find((obj) => obj.financial_year === fin_year);
		report.consumed_amount = report.consumed_amount + (approvedAmount - appliedAMount);
		await db_user.save();
		res.redirect('/tracker');
	} catch (err) {
		console.error(err);
		res.status(500).send({ message: 'Error while file approval' });
	}

	// fileStatus.save((err, db_status) => {
	// 	if (err) {
	// 		res.status(500).send({ message: err });
	// 		return;
	// 	}
	// 	const filter = { uid: inputfileId };
	// 	const update = { $push: { status: db_status._id }, vettedAmount: req.body.vettedAmount, message: req.body.message };
	// 	FileRecord.findOneAndUpdate(filter, update, { new: true }, (err, db_record) => {
	// 		if (err) {
	// 			res.status(500).send({ message: err });
	// 			return;
	// 		}
	// 		res.redirect('/tracker');
	// 	});
	// });
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

// fetch employee detail based on employee id
exports.getAmountLimits = async function (req, res) {
	let user = req.user;
	try {
		let on_behalf_user_id = req.params.on_behalf_user_id;
		if (on_behalf_user_id !== 'self') {
			//i.e. not for SELF
			user = await User.findById(on_behalf_user_id).select('-_id -__v').populate('designation').lean();
		}
		res.status(200).send(user);
	} catch (err) {
		console.error(err);
		res.status(500).send('error while fetching amount!!');
	}
};