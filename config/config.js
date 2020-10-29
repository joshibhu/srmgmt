module.exports = {
    upload_dir: 'C:/Bhuwan/Learning/GIT/srmgmt/tmp_uploads',
    authKey: 'JWTKeyForSecurity',
    file_status: {
        AWAITING_ACCEPTANCE: 'Awaiting Acceptance',
        ACCEPTED_AWAITING_FINANCE_ACTION: 'Accepted Awaiting Finance Action',
        RETURNED_WITH_OBSERVATIONS: 'Returned with Observations',
        CONCURRED_VETTED: 'Concurred/Vetted'
    },
    file_categories: [
        { text: 'Quotation', priority: 3 },
        { text: 'Safety', priority: 2 },
        { text: 'Tender', priority: 1 }
    ]
}

