/**
 * @module db_model
 */

"use strict";
const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
var LocalStrategy = require("passport-local").Strategy;
mongoose.connect("mongodb+srv://muthumpm:qlIwOUmyOG7a5ABX@mongodb.5sy58yd.mongodb.net/?appName=mongodb", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  // Optional: fail faster for quick debugging (ms)
  serverSelectionTimeoutMS: 5000,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // helpful diagnostics:
    if (err && err.reason && err.reason.servers) {
      console.error('Servers attempted:', Array.from(err.reason.servers.keys()));
    }
    process.exit(1);
  });
mongoose.set("useCreateIndex", true);
var JwtStrategy = require("passport-jwt").Strategy;
var ExtractJwt = require("passport-jwt").ExtractJwt;
const fs = require("fs");
const PUB_KEY = fs.readFileSync("./pub_key.pem", "utf8");
/**
* @function
* @author Muthu G & Balaji K
* @name User_Schema
* @description user schema
*/
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  name: String,
  store: String,
  branch: String,
  role: String,
  apptype: String,
  salt: String,
  hash: String,
  avatarGenerated: { type: Number, default: 0 },
});
/**
* @function
* @author Muthu G & Balaji K
* @name User_License
* @description user License schema
*/
const usersLicenseSchema = new mongoose.Schema({
  id: String,
  uuid: String,
  store: String,
  branch: String,
  licensekey: String,
  apptype: String,
});
/**
* @function
* @author Muthu G & Balaji K
* @name User_Model
* @description user model
*/
const UserModel = new mongoose.model("User", userSchema);
var opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ["RS256"],
};
/**
* @function
* @author Muthu G & Balaji K
* @name Passport_strategy
* @description passport  Strategy
*/
passport.use(
  new JwtStrategy(opts, function (jwt_payload, done) {
    UserModel.findOne({ _id: jwt_payload.sub }, function (err, user) {
      if (err) {
        return done(err, false);
      }
      if (user) {
        return done(null, user);
      } else {
        return done(null, false);
        // or you could create a new account
      }
    });
  })
);
/**
* @function
* @author Muthu G & Balaji K
* @name File_schema
* @description file schema
*/
const fileSchema = new mongoose.Schema({
  fileid: String,
  filename: String,
  filepath: String,
  store: String,
  filetype: String,
  created: { type: Date, default: Date.now },
  assigned: [{ user: String, id: String }],
  delivered: [{ user: String, id: String }],
  available: Boolean,
});
/**
* @function
* @author Muthu G & Balaji K
* @name Branch_schema
* @description branch schema
*/
const branchSchema = new mongoose.Schema({
  name: String,
  store: String,
  addressline1: String,
  addressline2: String,
  city: String,
  state: String,
  postcode: String,
  country: String,
  branchUsers: [{ user: String }],
});
/**
* @function
* @author Muthu G & Balaji K
* @name Flow_schema
* @description flow control schema
*/
const flowControlSchema = new mongoose.Schema({
  sourcenode: String,
  destinationbranches: [String],
  destinationnodes: [{ user: String, id: String }],
});
/**
* @function
* @author Muthu G & Balaji K
* @name Process_log_schema
* @description Process log schema
*/
const processlog = new mongoose.Schema({
  userid: String,
  name: String,
  store: String,
  date: { type: Date, default: Date.now },
  processType: String,
  result: String,
});
const avatarGeneration = new mongoose.Schema({
  userid: String,
  date: { type: Date, default: Date.now }
});
/**
* @function
* @author Muthu G & Balaji K
* @name File_schema
* @description file schema
*/
const productSchema = new mongoose.Schema({
  qr: String,
  name: String,
  price: String,
  quantity: String,
  store: String,
  origin: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'productcatlog' },
  createdAt: { type: Date, default: Date.now },
  show: Boolean,
  images: []
});
const productTypeSchema = new mongoose.Schema({
  name: String,
  store: String,
});
const productCatlogSchema = new mongoose.Schema({
  name: String,
  store: String,
  type: { type: mongoose.Schema.Types.ObjectId, ref: 'producttype' }
});
const nodeSync = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId },
  store: String,
  syncfiles: [],

});

module.exports = {
  User: UserModel,
  Product: new mongoose.model("product", productSchema),
  ProductType: new mongoose.model("producttype", productTypeSchema),
  ProductCatlog: new mongoose.model("productcatlog", productCatlogSchema),
  NodeSync: new mongoose.model("nodesync", nodeSync),
  File: new mongoose.model("file", fileSchema),
  Branch: new mongoose.model("branch", branchSchema),
  UserLicense: new mongoose.model("UserLicense", usersLicenseSchema),
  Flow: new mongoose.model("Flow", flowControlSchema),
  ProcessLog: new mongoose.model("ProcessLog", processlog),
  AvatarGeneration: new mongoose.model("AvatarGeneration", avatarGeneration),
  ProductFiles: mongoose.model("productfiles.files",
    new mongoose.Schema({ filename: String, contentType: String, uploadDate: Date }),
    "productfiles.files"
  ),
  ProductFilesChunks: mongoose.model("productfiles.chunks",
    new mongoose.Schema({ filename: String, data: Object, uploadDate: Date }),
    "productfiles.chunks"
  )
};
