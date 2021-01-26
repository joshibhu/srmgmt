

exports.getLastThreeFinancialYears = () => {
    let financialYears = [];
    let fiscalyear = "";
    let today = new Date();
    if ((today.getMonth() + 1) <= 3) {
        fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
    } else {
        fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
    }
    financialYears.push(fiscalyear);
    let count = 1;
    while (count < 3) {
        let left = parseInt(fiscalyear.split('-')[0]) - count;
        let right = parseInt(fiscalyear.split('-')[1]) - count;
        financialYears.push(left + '-' + right);
        ++count;
    }
    return financialYears;
}

exports.getCurrentFinancialYear = () => {
    let fiscalyear = "";
    let today = new Date();
    if ((today.getMonth() + 1) <= 3) {
        fiscalyear = (today.getFullYear() - 1) + "-" + today.getFullYear()
    } else {
        fiscalyear = today.getFullYear() + "-" + (today.getFullYear() + 1)
    }
    return fiscalyear;
}
