const mongoose = require('mongoose')
 
const roleSchema = new mongoose.Schema({
    title: {
        alias: 'title',
        type: String,
        required: true,
        trim: true,
        maxlength: 15,
    },
    description: {
        alias: 'description',
        type: String,
        unique: true,
        required: true,
        trim: true,
        maxlength: 150
    },
    createdTimestamp: {       
        type: String,
        trim: true,
        maxlength: 50
    },
    updatedTimestamp: {       
        type: String,
        trim: true,
        maxlength: 50
    }
}, { collection: 'role' });


const Role = mongoose.model('role', roleSchema)

module.exports = Role