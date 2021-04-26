const {admin} = require('../config/firebase.config')
const db = admin.firestore();

let questionList = {};
let userScoreList = {};
let assignmentList = {};
let assignmentListForDropdown = new Array(5);

async function getQuestions() {
    const snapshot = await db.collection('questions').get();
    snapshot.forEach((doc) => {
        questionList[doc.id] = doc.data()
    });

    const snapshot2 = await db.collection('hw_questions').get();
    snapshot2.forEach((doc) => {
        assignmentList[doc.id] = doc.data()
        let curr_doc_id = parseInt(doc.id.split("_")[0]) - 1
        // TODO add assignmentListForDropdown
    });
}

// getQuestions();

const getQuestion = (lesson, exnum) => {
    const questionId = "l" + lesson + "ex" + exnum;
    return questionList[questionId];
}

const getAssignment = (assignment, partnum, subpartnum) => {
    const questionId = assignment + "_" + partnum + "_" + subpartnum ;
    return assignmentList[questionId];
}


async function getUserProfiles() {
    const snapshot = await db.collection('users').get();
    snapshot.forEach((doc) => {
        userScoreList[doc.id + ""] = doc.data()
    });
    console.log(getUserProfiles)
    console.log(userScoreList)
}

// getUserProfiles();


module.exports = {
    userScoreList,
    questionList,
    assignmentList,
    getQuestion,
    getAssignment,
    getQuestions,
    getUserProfiles,
    getQuestions
}