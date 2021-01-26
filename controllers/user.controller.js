const config = require('../config/config.js');
const utility = require('../config/utility.js');
var logger = require('../config/winston');
const User = require('../models/user');
const Role = require('../models/role');
const Designation = require('../models/designation_mapping');


// fetch employee detail based on employee id
exports.register = async function (req, res) {
	res.status(200).render('user_register');
};

// fetch employee detail based on employee id
exports.updateUser = async function (req, res) {
	let { email, designation, role } = req.body;

	// Based on given designation id find designation mapping objection and then assign role accordingly
	Designation.findById(designation, (err, db_desgn) => {
		if (err) {
			req.flash('error', 'Error while updating record !');
			return;
		}
		let query;
		if (db_desgn.designation.includes('FX')) {
			query = { name: 'fx' }
		} else {
			query = { name: 'user' }

		}
		Role.findOne(query, (err, db_role_obj) => {
			if (err) {
				req.flash('error', 'Error while updating record !');
			}
			let update_stmt = { designation: designation, roles: [db_role_obj._id] };
			if (!db_desgn.designation.includes('FX')) {
				let reports = [];
				// on role assignment by admin, put last 3 years financial years default records for user role only
				let financialYears = utility.getLastThreeFinancialYears();
				financialYears.forEach((finyear) => {
					let report = {
						consumed_amount: 0,
						available_amount: db_desgn.capping_per_finyear,
						financial_year: finyear,
						limit_per_file: db_desgn.capping_per_file
					}
					reports.push(report);
				})
				update_stmt = { ...update_stmt, reports: reports }
			}
			User.findOneAndUpdate({ email: email }, update_stmt, { new: true }, (err, db_record) => {
				console.log(err);
				if (err) {
					req.flash('error', 'Error while updating record !');
				} else {
					req.flash('success', 'The record is updated successfully !');
				}
			});
		});
	});
	res.redirect('/user');
};
// fetch employee detail based on employee id
exports.getAllUsers = async function (req, res) {
	User.find().populate('roles').populate('designation')
		.then(function (db_records) {
			//filter out super admin
			db_records = db_records.filter((obj) => {
				return !obj.roles.includes(obj.roles.find(role => role.name === 'admin'));
			});
			Designation.find().then(function (db_desn_records) {
				if (db_desn_records && db_desn_records.length > 0) {
					db_desn_records = db_desn_records.filter((obj) => !(obj.mappedTo === '' && obj.capping_per_file === 1000000))
				}
				res.status(200).render('user', { table: db_records, designation_map: db_desn_records, page: 'user_mgmt', user: req.user, roles: req.roles })
			})
		})
		.catch(function (err) {
			// If an error occurred, send it to the client
			res.status(500).render('user', { message: "Error while fetching users" });
		});
};

// delete user
exports.deleteUser = async function (req, res) {
	User.findOneAndDelete({ email: req.body.email2 }, (err, db_record) => {
		if (err) {
			req.flash('error', 'Error while deleting user !');
		} else {
			req.flash('success', 'The user account is deleted successfully !');
		}
		res.redirect('/user');
	});
};

