const ApiRouter = require('./api.router');
const ReactRouter = require('./react.router');
const SubmitRouter = require('./submit.router');
const AdminRouter = require('./admin.router');
const MiscRouter = require('./misc.router');
const express = require("express");
const path = require("path")

function delegatorRouter(app) {
    app.use(express.static(path.join(__dirname, '/../../online-coding','build')));

    app.use('/api', ApiRouter)
    app.use(ReactRouter)
    app.use(MiscRouter)
    app.use(SubmitRouter)
    app.use('/admin', AdminRouter)

    return app;
}

module.exports = delegatorRouter;