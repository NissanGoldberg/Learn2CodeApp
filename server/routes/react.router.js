const express = require('express')
const path = require('path');

const ReactRouter = express.Router();

function reactController(req, res) {
    console.log(__dirname)
    res.sendFile(path.join(__dirname + '/../../online-coding','build', 'index.html'), function(err) {
        if (err) {
            res.status(500).send(err)
        }
    })
};


//react urls
ReactRouter.get("/", reactController);
ReactRouter.get("/id/:userId", reactController);
ReactRouter.get("/addhw", reactController);
ReactRouter.get("/admin/listcodes", reactController);
ReactRouter.get("/admin/viewcode/:id/:file", reactController);
ReactRouter.get("/admin/get", reactController);

module.exports = ReactRouter;