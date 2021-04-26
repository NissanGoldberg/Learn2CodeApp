const express = require('express');
const child_process = require("child_process");
const fs = require("fs");
const bodyParser = require("body-parser");
const {questionList} = require("../loaders/loader");
const {getAssignment} = require("../loaders/loader");
var urlencodedParser = bodyParser.urlencoded({ extended: false })
const {dirPath, assignment_due_dates} = require("../config/config");
const {userScoreList} = require("../loaders/loader");

const {admin} = require('../config/firebase.config')
const db = admin.firestore();
const SubmitRouter = express.Router();

function compare_ans_stdout(ans, stdout) {
    if (stdout===undefined || stdout==="")
        return false;

    const ans_trimmmed_with_spaces = ans.replace(/\n/g, " ").trim().toLowerCase();
    const std_trimmmed_with_spaces = stdout.replace(/\n/g, " ").trim().toLowerCase();

    const ans_trimmmed_wo_spaces = ans.replace(/\n/g, " ").trim().trim().replace(/\s/g,"").toLowerCase();
    const std_trimmmed_wo_spaces = stdout.replace(/\n/g, " ").trim().replace(/\s/g,"").toLowerCase();

    return ans_trimmmed_wo_spaces === std_trimmmed_wo_spaces ||
        ans_trimmmed_wo_spaces === std_trimmmed_with_spaces ||
        ans_trimmmed_with_spaces === std_trimmmed_wo_spaces ||
        ans_trimmmed_with_spaces === std_trimmmed_with_spaces;
}


SubmitRouter.post('/java_hw_submit', urlencodedParser,async (req, res) => {
    console.log(req.body.userName);
    let userDir = req.body.userName + '/';
    let userDirWithoutBackslash = req.body.userName;
    // console.log(req.body.Name); // console.log(req.body.assignment); // console.log(req.body.partnum); // console.log(req.body.subpartnum); // const lessonNum = req.body.LessonNum // const questionNum = req.body.QuestionNum


    let userName = req.body.userName;

    if (userName === undefined || userName === "" || userName.length !== 9) {
        res.send({msg: 'ID is not valid', status: "no Id"})
        return;
    }

    if (req.body.assignment === "undefined" || req.body.partNum === "undefined" || req.body.subPartNum === "undefined")
        res.send({msg: `No Exercise Selected`, status: "no exercise chosen"})

    let questionResult = getAssignment(req.body.assignment, req.body.partNum, req.body.subPartNum);

    if (questionResult === undefined) {
        res.send({msg: `Something went wrong, maybe you didnt choose exercise`,
            status: "no exercise chosen"})
        return;
    }

    //check date
    const current_time = Date.now();

    if (current_time > assignment_due_dates[req.body.assignment]) {
        res.send({msg: `The Due date has expired, you may submit until ${assignment_due_dates[req.body.assignment]}`,
            status: "submission date passed"})
        return;
    }


    console.log("test 1 in: " + questionResult.test1in);
    console.log("test 1 out: " + questionResult.test1out);

    // const questionId = "l" + req.body.LessonNum + "ex" + req.body.QuestionNum;
    // const questionId = "1_1_1"
    const questionId = req.body.assignment + "_" + req.body.partNum + "_" + req.body.subPartNum


    //Java Name Class
    //Ex1_1_1
    //Ex1_2
    const code_file_name = (`Ex${req.body.assignment}_${req.body.partNum}` + ((req.body.subPartNum !== "0") ? `_${req.body.subPartNum}` : ""));

    //create dir

    //another option: $ printf '9\n13\n' | java Main
    let cmd1 = `java -cp ${dirPath}${userDirWithoutBackslash} ${code_file_name} <<< "${questionResult.test1in}"`;
    let cmd2 = `java -cp ${dirPath}${userDirWithoutBackslash} ${code_file_name} <<< "${questionResult.test2in}"`;
    let cmd3 = `java -cp ${dirPath}${userDirWithoutBackslash} ${code_file_name} <<< "${questionResult.test3in}"`;

    let cmd4 = questionResult.test4in===undefined || questionResult.test4in==="" ?
        "" : `java -cp ${dirPath}${userDirWithoutBackslash} ${code_file_name} <<< "${questionResult.test4in}"` ;

    //alternative - alternative answer
    function execPromise(command, testNum, expected_out) {
        return new Promise(function (resolve, reject) {
            //test doesnt exist
            if (command === "") {
                resolve({stdout: "", testNum: testNum, passed: true, expected_out: ""});
            } else { // //else if there is a test
                child_process.exec(command, {shell: '/bin/bash'}, (error, stdout, stderr) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    //could be a few different outputs
                    let passed = expected_out.some(ex_out => ex_out !== "" ? compare_ans_stdout(stdout, ex_out) : false)

                    resolve({stdout: stdout.trim(), testNum: testNum, passed: passed, expected_out: expected_out});
                });
            }
        });
    }

    const test_java = async () => {
        try {
            var result1 = execPromise(cmd1, 1,
                (questionResult.test1out_alt !== undefined || questionResult.test1out_alt !=="") ? [questionResult.test1out, questionResult.test1out_alt] : [questionResult.test1out]);

            var result2 = execPromise(cmd2, 2,
                (questionResult.test2out_alt !== undefined || questionResult.test2out_alt !=="") ? [questionResult.test2out, questionResult.test2out_alt] : [questionResult.test2out]);

            var result3 = execPromise(cmd3, 3,
                (questionResult.test3out_alt !== undefined || questionResult.test3out_alt !=="") ? [questionResult.test3out, questionResult.test3out_alt] : [questionResult.test3out]);

            var result4 = execPromise(cmd4, 4,
                (questionResult.test4out_alt !== undefined || questionResult.test4out_alt !=="") ? [questionResult.test4out, questionResult.test4out_alt] : [questionResult.test4out]);

            return Promise.all([result1, result2, result3, result4]);
        } catch (e) {
            console.error(e.message);
        }
    }

    //create dir
    try {
        fs.mkdirSync(dirPath + userDir, {recursive: true});

        fs.writeFile(dirPath + userDir + `${code_file_name}.java`, req.body.UsersCode, function (err) {

            if (err) return console.log(err);
            console.log('Created Java file');

            try {
                //compile
                child_process.exec(`javac ${dirPath}${userDir}${code_file_name}.java`, async (err) => {
                    if (err) {
                        console.log(err);
                        try {
                            const err_msg = err.message.split("\n")[1] + err.message.split("\n")[2];
                            res.send({msg: "❌ : Could not compile.\nCheck class name.\nMaybe you included MyConsole?\n" +err_msg, status: "could not compile"});
                        } catch (e) {
                            res.send({msg: "❌ : Could not compile.\nCheck class name.\nMaybe you included MyConsole?\n", status: "could not compile"});
                        }
                        return;
                    }
                    console.log("compiled");

                    //run tests
                    await test_java().then(value => {
                        // console.log(value)
                        let failed = false;
                        let msg = "";

                        value.every(elem => {
                            if (elem.passed === false) {
                                const filtered = elem.expected_out.filter( (el) =>{
                                    return el !== undefined;
                                });

                                failed = true

                                if (elem.testNum!==4){
                                    res.send({
                                        msg: msg += `\nTest ${elem.testNum}` + ": failed ❌\n" +
                                            `your output ${elem.stdout.substring(0, 20)}\n` +
                                            `expected: ${filtered.join('\nor:\n')}`,
                                        status: 'failed'
                                    })
                                } else {
                                    res.send({
                                        msg: msg += `\nTest ${elem.testNum}` + ": failed ❌\n" +
                                            `Last tests input and output are hidden`
                                        ,
                                        status: 'failed'
                                    })
                                }


                                return false;
                            } else {
                                elem.expected_out !== "" ? msg += `Test ${elem.testNum} : passed ✔️\n` : msg += "";
                                return true;
                            }
                        });
                        if (!failed) {
                            try {
                                const userRef = db.collection('users').doc(req.body.userName);
                                // userRef.update({[questionId]: questionResult.points});
                                userRef.set({[questionId]: questionResult.points},
                                    {merge: true});

                            } catch (e) {
                                res.send(`There is no such ID`);
                                return;
                            }
                            return res.send({msg: msg + '\npassed all tests 😁', status: 'passed all'})
                        }
                        // res.json({value})
                    });
                });
            } catch (e) {
                console.log(e);
            }
        })

    } catch (e) {
        console.log('Cannot create folder ', e);
    }
});


// ============= java_submit -  NOT IN USE =============

SubmitRouter.post('/java_submit', urlencodedParser,async (req, res) => {
    console.log(req.body.userName);
    let userDir = req.body.userName + '/';
    let userDirWithoutBackslash = req.body.userName;
    console.log(req.body.Name);
    console.log(req.body.QuestionNum);
    console.log(req.body.LessonNum);

    const questionId = "l1ex2"
    try {

    }
    catch (e){
        console.log(e)
    }

    //create dir
    try {
        fs.mkdirSync(dirPath + userDir, { recursive: true } );
    } catch (e) {
        console.log('Cannot create folder ', e);
    }


    fs.writeFile(dirPath + userDir+ 'MainClass.java', req.body.UsersCode, function (err) {

        if (err) return console.log(err);
        console.log('Created Java file');
    })

    try {
        //compile
        child_process.exec(`javac ${dirPath}${userDir}MainClass.java`, (err) => {
            if (err) {
                console.log(err);
                // res.send(err);
                return;
            }
            console.log("compiled");
        });

        //run
        child_process.exec(`java -cp ${dirPath}${userDirWithoutBackslash} MainClass`,
            (err, stdout, stderr) => {
                console.log(stdout);
                console.log(err);
                const ans = questionList[questionId]['expectedOutput']
                if (stdout.trim() === ans)
                    res.send("Success: ✔️ answer is :" + stdout)
                else
                    res.send("Wrong answer: try again")

            })
    } catch (e) {
        console.log(e);
    }
})


module.exports = SubmitRouter;