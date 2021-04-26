const cookieParser = require("cookie-parser");
const cors = require('cors')
const express = require("express");

function decorate(app){
    app.use(cors())
    app.use(express.json());
    app.use(cookieParser());

    return app;
}

module.exports = decorate;
