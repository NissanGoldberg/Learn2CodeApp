const express = require("express");
const fs = require("fs");
const {getAssignment} = require("../loaders/loader");
const {admin_token} = require("../config/config");
const {getQuestions} = require("../loaders/loader");
const {admin} = require('../config/firebase.config')
const db = admin.firestore();
const AdminRouter = express.Router();

// admin appended to beginning of url

AdminRouter.post('/addHWExercise',async (req, res, next) => {
    console.log(req.body);
    const data = {...req.body};

    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "not authorized"})
        return next();
    }

    // if (data.token!==admin_token){
    //     console.log("token isnt valid")
    //     res.status(200).send({msg: "not authorized"})
    //     return next();
    // }

    delete data.token;
    let exNameKey = data.exNum + "_" + data.partNum + "_" + data.subPartNum;

    try {
        const res = await db.collection('hw_questions').doc(exNameKey).set(data);

    } catch (error) {
        // console.log(err);
        res.status(200).send("not authorized")
    }
    res.status(200).send({msg: "question uploaded"})
    getQuestions();
});

AdminRouter.post('/editHWExercise',async (req, res, next) => {
    console.log(req.body);
    const data = {...req.body};

    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "not authorized"})
        return next();
    }

    delete data.token;
    let exNameKey = data.exNum + "_" + data.partNum + "_" + data.subPartNum;

    try {
        let questionResult = {...getAssignment(data.exNum, data.partNum, data.subPartNum)};
        res.status(200).send({msg: "got ", question: {...questionResult}})
    } catch (error) {
        // console.log(err);
        res.status(200).send("not authorized")
    }
});

//view users code
AdminRouter.get('/removeAllCodes/', (req, res, next) => {
    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "not authorized"})
        return next();
    }

    const pathToDir = path.join(__dirname, "/../../users_code")
    // const pathToDir = path.join(__dirname, dirPathOnly)

    const removeDir = function(path) {
        if (fs.existsSync(path)) {
            const files = fs.readdirSync(path)

            if (files.length > 0) {
                files.forEach(function(filename) {
                    if (fs.statSync(path + "/" + filename).isDirectory()) {
                        removeDir(path + "/" + filename)
                    } else {
                        fs.unlinkSync(path + "/" + filename)
                    }
                })
                fs.rmdirSync(path)
            } else {
                fs.rmdirSync(path)
            }
        } else {
            console.log("Directory path not found.")
        }
    }
    removeDir(pathToDir)
    console.log("deleted files")

    //create dir
    try {
        fs.mkdirSync(pathToDir, { recursive: true } );
    } catch (e) {
        console.log('Cannot create folder ', e);
    }
    res.status(200).send("deleted all user code files");
})


//refresh db
AdminRouter.get('/refreshDB', (req, res, next) => {
    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "not authorized"})
        return next();
    }

    console.log("refreshing firebase DB - 1")
    getQuestions();
    console.log("refreshing firebase DB - 2")
    res.status(200).send("refreshing firebase DB")
})

module.exports = AdminRouter;