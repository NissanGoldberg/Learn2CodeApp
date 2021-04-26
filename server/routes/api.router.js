const express = require('express');
const path = require('path');
const fs = require("fs");
const {userScoreList, getAssignment} = require("../loaders/loader");
const {admin_token} = require("../config/config");
const ApiRouter = express.Router();

// each is appended with /api in the beginning

ApiRouter.get('/assignments', async (req, res, next)=>{
    // const lesson = req.params.lesson;
    // const exnum = req.params.exnum;
    console.log(`got hw request for: ${req.query.assignment} ${req.query.part} ${req.query.subpart}`)
    const assignment = req.query.assignment;
    const partNum = req.query.part;
    const subPartNum = req.query.subpart;
    try {
        // const textRes = await getText(lesson, exnum);
        //TODO: Query DB
        //     const textRes = getQuestionText(lesson, exnum);
        //deep copy
        let questionResult = {...getAssignment(assignment, partNum, subPartNum)};

        //remove question answers from student
        delete questionResult.test1in;
        delete questionResult.test1out;
        delete questionResult.test2in;
        delete questionResult.test2out;
        delete questionResult.test3in;
        delete questionResult.test3out;

        if (questionResult.test4in!==undefined || questionResult.test4in!==""){
            delete questionResult.test4in;
            delete questionResult.test4out;
        }

        if (questionResult.test1out_alt!==undefined || questionResult.test1out_alt!=="")
            delete questionResult.test1out_alt;

        if (questionResult.test2out_alt!==undefined || questionResult.test2out_alt!=="")
            delete questionResult.test2out_alt;

        if (questionResult.test3out_alt!==undefined || questionResult.test3out_alt!=="")
            delete questionResult.test3out_alt;

        if (questionResult.test4out_alt!==undefined || questionResult.test4out_alt!=="")
            delete questionResult.test4out_alt;


        return res.status(200).json({questionResult})
    } catch (e) {
        return next(e);
    }

})

ApiRouter.get('/admin_links',async (req, res, next) => {
    console.log(req.body);
    const data = {...req.body};

    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "Cannot GET /admin", auth: 'invalid'})
        return next();
    }

    delete data.token;
    console.log("/api/admin_links")
    res.status(200).send({msg: "access ", auth: "valid",
        links: { "list codes" : "/admin/listcodes", "add or edit homework" : "/addhw"}})

});

ApiRouter.get('/exercises', (req, res) => {
    let questionToSend = String.raw`# Euler's Identity`

    res.json({
        lessonNum: 2,
        exerciseNum: 3,
        questionName: "print hello",
        question: questionToSend,
        startCode: 'import java.util.Scanner;\n' + '\n' + 'public class HelloWorld {\n' + '\n' + '    public static void main(String[] args) {\n' + '}'
    });
})

//view users code
ApiRouter.get('/admin/viewcode/:id/:file', (req, res) => {
    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).json({auth: "not authorized"})
        return ;
    }

    const userId = req.params.id;
    const file = req.params.file;
    let path= __dirname + '/../../users_code/' + userId + "/" + file;
    try {
        fs.readFile(path, 'utf8', function (err,data) {
            if (err) {
                return console.log(err);
            }
            console.log("viewing users code")
            // console.log(data)

            res.json({
                lessonNum: "",
                exerciseNum: "",
                code: data
            });
            return ;
        });
    }catch (e) {
        res.status(200).json({msg: "no file"})
        return ;
    }
})

ApiRouter.get('/admin/listcodes/:id', (req, res) => {

    if (req.cookies.token!==admin_token){
        console.log("token isnt valid")
        res.status(200).send({msg: "not authorized"})
        return;
    }

    const userId = req.params.id;
    let path= __dirname + '/../../users_code/' + userId;

    let files_json = {"files": []}
    fs.readdir(path, (err, files) => {
        if (files!==undefined){
            files.forEach(file => {
                // console.log(file);
                if(!file.endsWith('.class'))
                    files_json.files.push(file);
            });
        }

        console.log(files_json);
        res.json(files_json);
    });
})

ApiRouter.get('/id/:userId', (req, res) => {
    console.log(req.params.userId)
    console.log('entered api id')
    try {
        let x = userScoreList[req.params.userId];
        console.log(x)
        let y = userScoreList[req.params.userId];
        res.status(200).json(x);
    } catch (e) {
        res.status(200).json(`'${req.params.userId}': { '1_0_0': '0'}`);
    }
});

// ApiRouter.all('*', (req, res) => {
//     console.log("This didnt work");
//
//     res.status(404).send({
//         msg: 'This resource doesnt exist',
//         success: false,
//     })
// })

module.exports = ApiRouter;