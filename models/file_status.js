const mongoose = require('mongoose')

const statusSchema = new mongoose.Schema({
    createdOn: {
        type: String,
        trim: true
    },
    createdBy: {
        type: String,
        trim: true
    },
    status: {
        type: String,
    }

}, { collection: 'file_status' });

const FileStatus = mongoose.model('file_status', statusSchema)

module.exports = FileStatus