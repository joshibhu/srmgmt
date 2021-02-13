const mongoose = require("mongoose");

const revAllocSchema = new mongoose.Schema({
    head_code: {
        type: String
    },
    sub_head_code: {
        type: String
    },
}, { collection: 'revenue_allocation' });

const RevAllocMap = mongoose.model('revenue_allocation', revAllocSchema);

module.exports = RevAllocMap;