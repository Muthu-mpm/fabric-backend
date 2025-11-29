"use strict";
var debug = require("debug");
var express = require("express");
var path = require("path");
var favicon = require("serve-favicon");
var logger = require("morgan");
var upload = require("multer");
var bodyParser = require("body-parser");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
var { router} = require("./src/index");
var products = require("./src/index");
var ejs = require("ejs");
var app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public/client")));
// app.use(cors({origin: 'http://localhost:3000'}));
/**
* this will set all of the url as CORS
* @returns {string}
*/
// var corsAcitvate= app.use("*", cors());

app.use(cors())
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use("/products", require("./src/controller/prodctcontroller"));
 app.use("/", router);

// app.get('*', (req,res) =>{
//   res.sendFile(path.join(__dirname, "client", "index.html"));
// });
/**
* this will get error message for notFound Exception
* @returns {string}
*/
var notFound= app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});


if (app.get("env") === "development") {
  /**
  * this will get error message for development Enviroinment
  * @returns {string}
  */
  var errStatus= app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render("error", {
      message: err.message,
      error: err,
    });
  });
}


/**
* this will get error message
* @returns {string}
*/
var errstatus= app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render("error", {
    message: err.message,
    error: {},
  });
});
/** This is a function for setting listenning port. */
app.set("port", process.env.PORT || 3001);
/**
 * The Port Address
 * @type {String}
 */
var server = app.listen(app.get("port"), function () {
  debug("Express server listening on port " + server.address().port);
});
