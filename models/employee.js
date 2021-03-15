const mongoose = require('mongoose')

const employeeSchema = new mongoose.Schema({
    employeeId: {
        alias: 'empId',
        type: String,
        required: true,
        trim: true
    },
    employeeName: {
        alias: 'empName',
        type: String,
        unique: true,
        required: true,
        trim: true
    }
}, { collection: 'employee' });


employeeSchema.statics.findByEmployeeId = async (empId) => {
    const employee = await Employee.findOne({ 'employeeId': empId })

    if (!employee) {
        throw new Error('Invalid employee Id')
    }

    return employee;
}

const Employee = mongoose.model('employee', employeeSchema)

module.exports = Employee