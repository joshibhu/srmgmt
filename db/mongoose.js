const mongoose = require('mongoose')
const DesgMap = require("../models/designation_mapping");
const User = require("../models/user");
const Role = require("../models/role");
const config = require('../config/config');

class db {
    default_args = {
        MONGODB_URI: config.mongo_db_uri
    }

    constructor() {
        this.connect();
    }

    async connect() {
        mongoose.connect(this.default_args.MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true, useFindAndModify: false });
        mongoose.connection.once('connected', () => {
            console.log('Successfully connect to MongoDB.');
            initial();
        });
        mongoose.connection.on('error', (err) => {
            console.log('Error connecting to MongoDB:', err);
            process.exit();
        });
        mongoose.connection.on('disconnected', () => console.log('Disconnected'))
    }
}

function initial() {
    let user_role_id, admin_role_id, fx_role_id;
    Role.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            new Role({
                name: "user"
            }).save((err, doc) => {
                if (err) {
                    console.log("error", err);
                }
                user_role_id = doc._id;
                console.log("added 'user' to roles collection");
                new Role({
                    name: "admin"
                }).save((err, doc) => {
                    if (err) {
                        console.log("error", err);
                    }
                    admin_role_id = doc._id;
                    console.log("added 'admin' to roles collection");
                    new Role({
                        name: "fx"
                    }).save((err, doc) => {
                        if (err) {
                            console.log("error", err);
                        }
                        fx_role_id = doc._id;
                        console.log("added 'fx' to roles collection");
                        //create an temp admin account by default
                        User.estimatedDocumentCount((err, count) => {
                            if (!err && count === 0) {
                                new User({ name: 'sys_admin', email: 'sys_admin@gmail.com', password: 'sys_admin', roles: [admin_role_id] }).save(err => {
                                    if (err) {
                                        console.log("error", err);
                                    }
                                });
                            }
                        });
                    });
                });

            });




        }
    });
    DesgMap.estimatedDocumentCount((err, count) => {
        if (!err && count === 0) {
            config.designation_mapping.forEach((obj) => {
                new DesgMap({ designation: obj.designation, mappedTo: obj.mappedTo }).save(err => {
                    if (err) {
                        console.log("error", err);
                    }
                });
            });
        }
    });
}

module.exports = new db();