const express = require("express");
const MiscRouter = express.Router();
const {admin} = require('../config/firebase.config')
const db = admin.firestore();

MiscRouter.post('/addExercise',async (req, res) => {
    console.log(req.body);
    const data = {...req.body};
    delete data.questionId;
    try {
        const res = await db.collection('questions').doc(req.body.questionId).set(data);

    } catch (error) {
        console.log(err);
    }
    res.status(200).send("refreshing firebase DB")
});


MiscRouter.get('/signin', (req, res) => {
    res.cookie("userIdNode", "12234");
});

MiscRouter.get('/test', (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});


MiscRouter.get('/exercises', async (req, res, next)=>{
    // const lesson = req.params.lesson;
    // const exnum = req.params.exnum;
    console.log(`got request for: ${req.query.assignment} ${req.query.exnum}`)
    const lesson = req.query.lesson;
    const exnum = req.query.exnum;
    try {
        const questionResult = getQuestion(lesson, exnum);
        return res.status(200).json({questionResult})
    } catch (e) {
        return next(e);
    }

})



module.exports = MiscRouter;