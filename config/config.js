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
    upload_dir: 'C:/Bhuwan/Learning/GIT/srmgmt/tmp_uploads',
    authKey: 'JWTKeyForSecurity',
    file_status,
    action_status_map_arr: [
        { curr_status: file_status.FILE_RECORD_SAVED, action: 'Submit For Acceptance', new_status: file_status.SUBMITTED_FOR_ACCEPTANCE },
        { curr_status: file_status.SUBMITTED_FOR_ACCEPTANCE, action: 'Accept', new_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION },
        { curr_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, action: 'Return', new_status: file_status.RETURNED_WITH_OBSERVATIONS },
        { curr_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION, action: 'Approve', new_status: file_status.CONCURRED_VETTED },
        { curr_status: file_status.RETURNED_WITH_OBSERVATIONS, action: 'Re-submit', new_status: file_status.RESUBMITTED_FOR_ACCEPTANCE },
        { curr_status: file_status.RESUBMITTED_FOR_ACCEPTANCE, action: 'Accept', new_status: file_status.ACCEPTED_AWAITING_FINANCE_ACTION }
    ],
    file_categories: [
        { text: 'Quotation', priority: 3 },
        { text: 'Safety', priority: 2 },
        { text: 'Tender', priority: 1 }
    ]
}

