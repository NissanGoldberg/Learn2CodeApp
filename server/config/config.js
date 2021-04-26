const port = process.env.PORT || 9000
const admin_token = process.env.ADMIN_TOKEN; //read from env variable

var dirPath = __dirname + "/../../users_code/"
var dirPathOnly = "users_code"

// var serviceAccount = require("./keys/ServiceAccountKey.json");
var serviceAccount = process.env.FIREBASE_CREDENTIALS;

//TODO either give admin capability to change or read from json
assignment_due_dates = {"1" : new Date('April 20, 2021 23:59:59'),
    "2" : new Date('May 05, 2021 23:59:59'),
    "3" : new Date('May 05, 2021 23:59:59'),
    "4" : new Date('May 19, 2021 23:59:59'),
    "5" : new Date('May 25, 2021 23:59:59'),
}

module.exports = {
    port,
    admin_token,
    dirPath,
    dirPathOnly,
    serviceAccount,
    assignment_due_dates
}
