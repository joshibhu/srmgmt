const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const config = require('../config/config.js')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        trim: true,
        unique: true,
        required: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        maxlength: 50,
        minlength: 7,
        trim: true
    },
    designation: {
        type: mongoose.Schema.Types.ObjectId, ref: 'designation_mapping',
    },
    roles: [{
        type: mongoose.Schema.Types.ObjectId, ref: 'role'
    }]
}, { timestamps: true, collection: 'user' });

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.statics.findByDesingations = async (designation_ids) => {
    const users = await User.find({ designation: { $in: designation_ids } });
    return users.map(obj => obj._id);

}

// Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

const User = mongoose.model('user', userSchema)

module.exports = User