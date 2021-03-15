const mongoose = require('mongoose')

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uid: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        maxlength: 20,
    },
    amount: {
        type: Number,
        required: true
    },
    financialYear: {
        type: String,
        required: true,
    },
    onBehalfOf: {
        type: String,
        default: 'self'
    },
    dealer: {
        type: String,
    },
    contact: {
        type: String
    },
    observation: {
        type: String
    },
    fundType: {
        type: String
    },
    allocation: {
        type: String
    },
    vettedAmount: {
        type: Number
    },
    message: {
        type: String,
        maxlength: 150
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    createTimestamp: {
        type: String,
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    updateTimestamp: {
        type: String,
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    status: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'file_status'
    }]
}, { collection: 'file_record' });


fileSchema.statics.findByUniqueId = async (uid) => {
    const file = await FileRecord.findOne({ 'uid': uid })

    if (!file) {
        throw new Error('Invalid file Id')
    }

    return file;
}

const FileRecord = mongoose.model('file_record', fileSchema);

module.exports = FileRecord