const file_status = {
    FILE_RECORD_SAVED: 'File Record Saved',
    SUBMITTED_FOR_ACCEPTANCE: 'Submitted For Acceptance',
    //AWAITING_ACCEPTANCE: 'Awaiting Acceptance',
    ACCEPTED_AWAITING_FINANCE_ACTION: 'Accepted Awaiting Finance Action',
    RETURNED_WITH_OBSERVATIONS: 'Returned with Observations',
    CONCURRED_VETTED: 'Concurred/Vetted',
    RESUBMITTED_FOR_ACCEPTANCE: 'Re-Submitted For Acceptance'
}

module.exports = {
    mongo_db_uri: 'mongodb://127.0.0.1:27017/srmgmt',
    authKey: 'JWTKeyForSecurity',
    file_status,
    action_status_map_arr: [
        { curr_status: file_status.FILE_RECORD_SAVED, action: 'Submit For Acceptance', new_status: file_status.SUBMITTED_FOR_ACCEPTANCE, scope: 'user' },
        { curr_status: file_status.SUBMITTED_FOR_ACCEPTANCE, action: 'Accept', new_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, scope: 'fx' },
        { curr_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, action: 'Return', new_status: file_status.RETURNED_WITH_OBSERVATIONS, scope: 'fx' },
        { curr_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, action: 'Approve', new_status: file_status.CONCURRED_VETTED, scope: 'fx' },
        { curr_status: file_status.RETURNED_WITH_OBSERVATIONS, action: 'Re-submit', new_status: file_status.RESUBMITTED_FOR_ACCEPTANCE, scope: 'user' },
        { curr_status: file_status.RESUBMITTED_FOR_ACCEPTANCE, action: 'Accept', new_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, scope: 'fx' }
    ],
    // file_categories: [
    //     { text: 'Quotation', priority: 3 },
    //     { text: 'Safety', priority: 2 },
    //     { text: 'Tender', priority: 1 }
    // ],
    file_categories: [
        { text: 'Quotation', priority: 3 },
        { text: 'Estimate', priority: 2 },
        { text: 'Tender Agreement', priority: 1 },
        { text: 'Indent', priority: 4 },
        { text: 'Work Order', priority: 5 },
        { text: 'Comparative', priority: 6 },
        { text: 'Finance Establishment', priority: 7 }
    ],
    designation_mapping: [
        { designation: 'Senior_DEN_1', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEN_2', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEN_3', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEN_4', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEN_5', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEN_6', mappedTo: 'FX-1', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DOM_Safety', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DOM_G', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DOM_Coaching', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEE_G', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEE_TRD', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DEE_RSO', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DSTE', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DME_CNW', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DME_ONF', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DME_Diesel', mappedTo: 'FX-2', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'SECIOR_DSC', mappedTo: 'FX-3', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'JRRPF', mappedTo: 'FX-3', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Third_Battalion', mappedTo: 'FX-3', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'CMS', mappedTo: 'FX-3', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'Senior_DMM_MaterialMgmt', mappedTo: 'FX-3', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Senior_DCM(Fright)', mappedTo: 'FX-4', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'Seniod_DCM', mappedTo: 'FX-4', capping_per_file: 500000, capping_per_finyear: 6000000 },
        { designation: 'FX-1', mappedTo: '' },
        { designation: 'FX-2', mappedTo: '' },
        { designation: 'FX-3', mappedTo: '' },
        { designation: 'FX-4', mappedTo: '' },
        { designation: 'ADRM_Admin', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'ADRM_Infra', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'ADRM_BSB', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'ADRM_BUO', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'ADRM_Operation', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 },
        { designation: 'DRM', mappedTo: 'none', capping_per_file: 1000000, capping_per_finyear: 12000000 }
    ],
    fundTypes: ['Revenue', 'Capital'],
    allocations: ['01', '02', '03']
}

