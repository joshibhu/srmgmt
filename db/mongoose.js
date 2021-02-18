const mongoose = require('mongoose')
const DesgMap = require("../models/designation_mapping");
const User = require("../models/user");
const Role = require("../models/role");
const config = require('../config/config');
const utility = require('../config/utility');
const RevAlloc = require("../models/revenue_allocation");
const fs = require("fs");
const path = require("path");

class db {
    default_args = {
        MONGODB_URI: process.env.MONGODB_URI || config.mongo_db_uri
    }

    constructor() {
        this.connect();
    }

    async connect() {
        mongoose.connect(this.default_args.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
        mongoose.connection.once('connected', async () => {
            console.log('Successfully connect to MongoDB.');
            await initial();
        });
        mongoose.connection.on('error', (err) => {
            console.log('Error connecting to MongoDB:', err);
            process.exit();
        });
        mongoose.connection.on('disconnected', () => console.log('Disconnected'))
    }
}

async function initial() {
    let role_count = await Role.estimatedDocumentCount();
    if (role_count === 0) {
        await new Role({ name: "user" }).save();
        await new Role({ name: "fx" }).save();
        let db_role_admin = await new Role({ name: "admin" }).save();
        await new User({ name: 'sys_admin', email: 'sys_admin@gmail.com', password: 'sys_admin', roles: [db_role_admin._id] }).save();
    }


    let count = await DesgMap.estimatedDocumentCount();
    if (count === 0) {
        for (const obj of config.designation_mapping) {
            await new DesgMap({ designation: obj.designation, mappedTo: obj.mappedTo, capping_per_file: obj.capping_per_file, capping_per_finyear: obj.capping_per_finyear }).save();
        }
    }

    // create special users
    //1. find designations of special users
    let special_desgns = await DesgMap.find({ mappedTo: 'none' }).lean();
    let special_users = [];
    for (const elem of special_desgns) {
        let user = await User.findOne({ name: elem.designation }).lean();
        if (!user) {
            let reports = [];
            //  put last 3 years financial years default records for these users
            let financialYears = utility.getLastThreeFinancialYears();
            financialYears.forEach((finyear) => {
                let report = {
                    consumed_amount: 0,
                    financial_year: finyear,
                }
                reports.push(report);
            })
            special_users.push(new User({ name: elem.designation, email: elem.designation + '@gmail.com', designation: elem, reports: reports }));
        } else {
            //check if for exisitng user need to make an entry in database for current finacial year
            let current_finyear = utility.getCurrentFinancialYear();
            let report = user.reports.find((report) => report.financial_year === current_finyear);
            if (!report) {
                // add report for current financial year
                let report = {
                    consumed_amount: 0,
                    financial_year: current_finyear,
                }
                user.reports.push(report);
                await user.save();
            }
        }
    };
    if (special_users.length > 0) {
        await User.insertMany(special_users);
    }

    // upload rev allocations code
    let rev_alloc_count = await RevAlloc.estimatedDocumentCount();
    if (rev_alloc_count === 0) {
        // Read users.json file
        let data = fs.readFileSync(path.join(__dirname, '../config/rev_alloc.json'));
        const rev_allocs = JSON.parse(data);
        await RevAlloc.insertMany(rev_allocs);
    }
}

module.exports = new db();