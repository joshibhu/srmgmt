const mongoose = require("mongoose");

const designationSchema = new mongoose.Schema({
    designation: String,
    mappedTo: String,
    fileCount: {
        type: Number,
        default: 0
    } // specifically for FX user to maintain file id
}, { collection: 'designation_mapping' });

designationSchema.statics.findUserDesignationIds = async (fx_desgn_id) => {
    let db_records = await DsgnMap.find();
    // console.log('##############fx_desgn_id', fx_desgn_id, db_records);
    //find fx designation by id
    const fx_designation = db_records.find((elem) => JSON.stringify(elem._id) === JSON.stringify(fx_desgn_id));
    //console.log('############fx_designation', fx_designation);
    //find designations which reports to the above fx
    let designation_arr = db_records.filter((elem) => elem.mappedTo === fx_designation.designation);
    // find only desingation object ids
    let designation_ids = designation_arr.map(obj => obj._id);
    //console.log(designation_ids);
    return designation_ids;
};
const DsgnMap = mongoose.model('designation_mapping', designationSchema);

module.exports = DsgnMap;