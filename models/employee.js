const mongoose = require('mongoose')
 
const employeeSchema = new mongoose.Schema({
    employeeId: {
        alias: 'empId',
        type: String,
        required: true,
        trim: true,
        maxlength: 15,
    },
    employeeName: {
        alias: 'empName',
        type: String,
        unique: true,
        required: true,
        trim: true,
        maxlength: 50
    }
}, { collection: 'employee' });


employeeSchema.statics.findByEmployeeId = async (empId) => {
    const employee = await Employee.findOne({'employeeId':empId})

    if (!employee) {
        throw new Error('Invalid employee Id')
    }    

    return employee;
}

const Employee = mongoose.model('employee', employeeSchema)

module.exports = Employee