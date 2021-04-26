/*TODO fix global server/loaders/loader.js
the variables aren't global and are not concurrent. check both.
maybe require is enough
 */
const express = require('express')
const app = express()

const { port, admin_token, dirPath, dirPathOnly, serviceAccount, assignment_due_dates } = require('./server/config/config')
const decorate = require('./server/middleware/decorator.middleware')
const delegate = require('./server/routes/delegator.router')
const {admin} = require('./server/config/firebase.config')
const {getQuestions, getUserProfiles} = require('./server/loaders/loader')
const db = admin.firestore();


var bodyParser = require('body-parser')
fs = require('fs');



getQuestions();
getUserProfiles()

decorate(app); // in middleware dir
delegate(app); // for api and react routes


// let { userScoreList, questionList, assignmentList, getQuestion, getAssignment, getQuestions, getUserProfiles} = require('./server/loaders/loader')

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})
