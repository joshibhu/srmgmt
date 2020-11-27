const mongoose = require('mongoose')
// role - admin, fx, user

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        maxlength: 15,
    }
}, { collection: 'role' });


const Role = mongoose.model('role', roleSchema)

module.exports = Role