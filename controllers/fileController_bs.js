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
			res.status(200).send(status_arr);
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
			//iterate over db records and find and add current status and next status value
			db_records.forEach((item) => {
				let currStatus = item.status[item.status.length - 1].status;
				let nextActions = findNextActions(currStatus);
				item.currStatus = currStatus;
				item.nextActions = nextActions;
			})
			// If we were able to successfully find an Product with the given id, send it back to the client
			//res.status(200).send(db_records);
			let currentYear = new Date().getFullYear();
			res.status(200).render('file_view', { table: db_records, categories: config.file_categories, years: [currentYear, currentYear - 1, currentYear - 2], status: Object.keys(config.file_status) })
		})
		.catch(function (err) {
			// If an error occurred, send it to the client
			res.status(500).render('file_view', { message: "Error while fetching file record" });
		});
};

function findNextActions(currStatus) {
	return config.action_status_map_arr.filter((item) => (currStatus === item.curr_status)).map(item => item.action);
}

// fetch employee detail based on employee id
exports.deleteFileRecord = async function (req, res) {
	console.log('########################', req.body.uid)
	FileRecord.findOneAndDelete({ uid: req.body.uid }, (err, db_record) => {
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
				res.redirect('/tracker');
			});
		} else {
			res.status(400).send({ message: 'record does not exist !!' });
		}
	});
};

// create a file record
exports.createFileRecord = async function (req, res) {
	// save status first and then file record
	const fileStatus = new FileStatus({ status: config.file_status.FILE_RECORD_SAVED, createdOn: format('dd-MM-yyyy hh.mm.ss', new Date()) });
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
			res.redirect('/tracker');
		});
	});
};

// update by admin
exports.updateFileRecord = async function (req, res) {
	let { uid, ...body } = req.body;
	FileRecord.findOneAndUpdate({ uid: uid }, body, { new: true }, (err, db_record) => {
		if (err) {
			res.status(500).redirect('/');
			return;
		}
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
