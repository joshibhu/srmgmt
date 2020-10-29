const mongoose = require('mongoose')

const recordSchema = new mongoose.Schema({
    recordType: {
        type: String,
        required: true,
        trim: true
    },
    tokenNumber: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    comment: {
        type: String,
        trim: true
    },
    createTimestamp: {
        type: String,
        required: true
    },
    createdBy: {
        type: String
    },
    employeeId: {
        alias:'empId',
        type: String,
        required: true
    }
}, { collection: 'recordhistory' });

recordSchema.statics.findByEmployeeId = async (empId) => {
    const records = await RecordHistory.find({'employeeId':empId })

    if (!records) {
        throw new Error('Invalid employee Id')
    }

    return records;
}


const RecordHistory = mongoose.model('recordhistory', recordSchema)

module.exports = RecordHistory