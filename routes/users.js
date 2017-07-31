const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Report = require('../models/report');
const config = require('../config/database');

//Register
router.post('/register', (req, res) => {
    //console.log(req.body);
    let newUser = new User({
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });
    console.log("request received");
    User.addUser(newUser, (err, user) => {
        if (err) {
            res.json({
                success: false,
                message: 'Failed to register User!',
                error: err
            });
        } else {
            res.json({
                success: true,
                message: 'User registered!'
            });
        }
    });
});

//Authenticate
router.post('/authenticate', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUsername(username, (err, user) => {
        if (err) throw err;
        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) {
                const token = jwt.sign(user, config.secret, {
                    expiresIn: 3600
                });

                res.json({
                    success: true,
                    token: 'JWT ' + token,
                    user: {
                        name: user.name,
                        id: user._id,
                        email: user.email,
                        username: user.username
                    }
                });
            } else {
                return res.json({
                    success: false,
                    message: "Wrong username or password"
                });
            }
        });
    });

});

//Profile
router.get('/profile', passport.authenticate('jwt', {
    session: false
}), (req, res, next) => {
    Report.showReports(req.user._id, (err, reports) => {
        if(err) throw err;
        else {
            res.json({
                user: req.user,
                reports: reports
            });
        }
    });
});

router.post('/compile', (req, res, next) => {
    let newFile = {
        code: req.body.code,
        input: req.body.input,
        language: req.body.language
    };
    var isError = true;

    //console.log(req.body.user);

    let outputFile = {
        success: false,
        output: "",
        stderr: "",
        error: ""
    };
    const exec = require('child_process').exec;
    const fs = require('fs');
    var cmd = '';
    const codeFileName = 'tempFiles/code.txt';
    const inputFileName = 'tempFiles/input.txt';
    try {
        var check = fs.writeFileSync(codeFileName, newFile.code);
        check = fs.writeFileSync(inputFileName, newFile.input);
    } catch (error) {
        console.log(error);
    }
    switch(newFile.language) {
        case 'c':       cmd = "cd tempFiles && cat > temp.c < code.txt && gcc temp.c && timeout 1s ./a.out < input.txt";
                        break;
        case 'cpp':     cmd = "cd tempFiles && cat > temp.cpp < code.txt && g++ temp.cpp && timeout 1s ./a.out < input.txt";
                        break;
        case 'java':    cmd = "cd tempFiles && cat > temp.java < code.txt && javac temp.java && timeout 1s java temp < input.txt";
                        break;
        case 'python':  cmd = "cd tempFiles && cat > temp.py < code.txt && timeout 1s python temp.py < input.txt";
                        break;
        default: console.log("Invalid File format Error");
    }
    const child = exec(cmd,
        (error, stdout, stderr) => {
            if (error !== null) {
                console.log("Error Occur (EXEC_ERR)::"+error);
                outputFile.success = true;
                outputFile.error = error;
                if(stderr.length > 0) {
                    console.log("STD_Error Occur ::"+stderr);
                    outputFile.success = true;
                    outputFile.stderr = stderr;
                }
            } else {
                if(stderr.length > 0) {
                    console.log("STD_Error Occur ::"+stderr);
                    outputFile.success = true;
                    outputFile.stderr = stderr;
                } else {
                    console.log("Executing ::"+stdout);
                    outputFile.success = true;
                    outputFile.output = stdout;
                    isError = false;
                }
            }
            stdOutput = outputFile.output;
            if(isError) {
                stdOutput = outputFile.stderr;
            }
            if(stdOutput.length <= 0) {
                stdOutput = "Runtime Error:: Time Limit may exceeds.";
                outputFile.stderr = stdOutput;
            }
            let newReport = new Report({
                author_id: req.body.user._id,
                author: req.body.user.username,
                code: req.body.code,
                output: stdOutput,
                isError: isError,
                compiledOn: new Date(),
                language: req.body.language
            });

            Report.addReport(newReport, (err, report)=> {
                if(err) {
                    console.log("Report not added due to:: "+err);
                }
                else {
                    console.log("Report Added");
                    res.json(outputFile);
                }
            });
        });
});

module.exports = router;