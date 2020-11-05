const config = require('../config/config.js');
const uid = require('rand-token').uid;
const format = require('date-format');
var logger = require('../config/winston');
const FileRecord = require('../models/file_record');
const FileStatus = require('../models/file_status');

// fetch employee detail based on employee id
exports.getFileRecord = async function (req, res) {

	FileRecord.findOne({ uid: req.params.fileId })
		.populate('status')
		.then(function (db_record) {
			// If we were able to successfully find an Product with the given id, send it back to the client
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
	FileRecord.find().populate('status')
		.then(function (db_records) {
			// If we were able to successfully find an Product with the given id, send it back to the client
			//res.status(200).send(db_records);
			res.status(200).render('viewFileRecords', { table: db_records })
		})
		.catch(function (err) {
			// If an error occurred, send it to the client
			res.status(500).render('viewFileRecords', { message: "Error while fetching file record" });
		});
};

// fetch employee detail based on employee id
exports.deleteFileRecord = async function (req, res) {
	FileRecord.findOneAndDelete({ uid: req.params.fileId }, (err, db_record) => {
		if (err) {
			res.status(500).send({ message: err });
			return;
		}
		if (db_record) {
			let status_id_arr = db_record.status.filter((item) => item._id);
			FileStatus.deleteMany({ _id: { $in: status_id_arr } }, (err) => {
				if (err) {
					res.status(500).send({ message: err });
					return;
				}
				res.status(200).send(status_id_arr);
			});
		} else {
			res.status(200).send({ message: 'record does not exist !!' });
		}
	});
};

// create a file record
exports.createFileRecord = async function (req, res) {
	// save status first and then file record
	const fileStatus = new FileStatus({ status: config.file_status.AWAITING_ACCEPTANCE, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	fileStatus.save((err, db_status) => {
		if (err) {
			res.status(500).render('addRecord', { message: err });
			return;
		}
		const uniqueFileId = uid(8);
		let additionalObj = { uid: uniqueFileId, createTimestamp: format('dd-MM-yyyy hh.mm.ss', new Date()), status: db_status._id };
		const file_record = new FileRecord({ ...req.body, ...additionalObj });
		file_record.save((err, db_record) => {
			if (err) {
				res.status(500).render('addRecord', { message: err });
				return;
			}
			res.status(200).render('addRecord', { message: { "successMessage": "File Record added successfully. Unique Id generated is :" + uniqueFileId } });
			//res.status(200).send(db_record);
		});
	});
};

// update by admin
exports.updateFileRecord = async function (req, res) {
	//if admin then the below status
	const fileStatus = new FileStatus({ status: config.file_status.RESUBMIT_AWAITING_ACCEPTANCE, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	//if user then it should be AWAITING_ACCEPTANCE
	// add status and then update file record
	fileStatus.save((err, db_status) => {
		if (err) {
			res.status(500).render({ message: err });
			return;
		}
		const filter = { uid: req.params.fileId };
		const update = { amount: req.body.amount, $push: { status: db_status._id } };
		FileRecord.findOneAndUpdate(filter, update, { new: true }, (err, db_record) => {
			if (err) {
				res.status(500).render({ message: err });
				return;
			}
			res.status(200).render('updateRecord', { record: db_record, message: 'Record updated successfully !!' });
		});
	});
}

// update by admin
exports.updateFileRecordStatus = async function (req, res) {
	// delete from the database
	let inputfileId = req.params.fileId;
	let action = req.params.action;
	let fileStatus;
	if (action === 'accept') {
		fileStatus = new FileStatus({ status: config.file_status.ACCEPTED_AWAITING_FINANCE_ACTION, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	} else if (action === 'reject') {
		fileStatus = new FileStatus({ status: config.file_status.RETURNED_WITH_OBSERVATIONS, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	} else if (action === 'approved') {
		fileStatus = new FileStatus({ status: config.file_status.CONCURRED_VETTED, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
	}
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
			res.status(200).send(db_record);
		});
	});
}