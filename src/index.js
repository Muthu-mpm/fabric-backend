/**
 * @module Route_js
 */

"use strict";
var express = require("express");
var router = express.Router();
var oynadb = require("./db_model");
const { ensureAuthenticated } = require("./auth.js");
const passportLocalMongoose = require("passport-local-mongoose");
const passport = require("passport");
const session = require("express-session");
const fs = require("fs");
var multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const utils = require("./utils");
const secret = "oysdfna16sad50";
const ObjectId = require("mongodb").ObjectID;
const crypto = require("crypto");
const Base64 = require("crypto-js/enc-base64");
const mongoose = require("mongoose");
const path = require("path");
// const upload1 = multer({ dest: 'AvatarGenerator/' });
var absolutePath = path.resolve("D:\Oyna Cloud React\Oyna Cloud Manager\server\src\avatar_sdk_full_body_standalone_3.0.2\avatar_sdk_full_body_standalone.exe");

const execFile = require('child_process').execFile;
const { json } = require("body-parser");
require("dotenv").config();

const mongoURI = "mongodb+srv://muthumpm:qlIwOUmyOG7a5ABX@mongodb.5sy58yd.mongodb.net/?appName=mongodb";

// connection
const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let gfs;
conn.once("open", () => {
  // init stream
  gfs = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "uploads",
  });
});
const storage = new GridFsStorage({
  url: mongoURI,
  file: (req, file) => {
    return new Promise((resolve, reject) => {
      crypto.randomBytes(16, (err, buf) => {
        if (err) {
          return reject(err);
        }
        const filename = buf.toString("hex") + path.extname(file.originalname);
        const fileInfo = {
          filename: filename,
          bucketName: "uploads",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
}).single("oynafile");

//var upload = multer({ dest: 'uploads/' }).single('oynafile');
var localstorage = multer.diskStorage({
  destination: function(req, file, cb) {
  const dir = 'uploads/AvatarImages';
  console.log("local stoarage");
  fs.exists(dir, exist => {
  if (!exist) {
    return fs.mkdir(dir, error => cb(error, dir))
  }
  return cb(null, dir)
  })
},
   //  cb(null, './uploads/'req.user.nam);

  filename: function (req, file, cb) {
     let extens=file.originalname.split('.').pop();
     cb(null , file.fieldname + '-' + Date.now()+'.'+extens);// file.originalname
  }
});

var avatarupload = multer({ storage: localstorage }).single("avatarfile");
/**
* @function
* @author Muthu G & Balaji K
* @name Error_Catch
* @description It will catching the Error
* @param {String} name - Url of Error
*/

router.get("/", function (req, res) {
  Promise.resolve()
    .then(function () {
      console.log("error");
    })
    .catch(next); // Express will catch this on its own.
});

router.post(
  "/AvatarGenerator", 
  function (req, res) {
    console.log("process initial");
     avatarupload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        console.log(err);
        // A Multer error occurred when uploading.
      } else if (err) {
        console.log(err);
        // An unknown error occurred when uploading.
      }
    try{
      console.log("process start");
        const { spawn } = require('child_process');
        console.log("Request",req.file);
        console.log("Weight", req.body.weight);
        console.log("hairstyle", req.body.hairstyle);

        //res.status(200).json({ Sucess: true });
        let weight=req.body.weight;
        let hairstyle= req.body.hairstyle;

        let image ="./"+ req.file.destination+"/"+req.file.filename;
        let filename= path.parse(req.file.filename).name;  
        let desPath ="./"+ req.file.destination+"/"+filename;
        console.log(process.env.Avatar_EXE, [weight,image, hairstyle,desPath]);
        //   filename: req.file.originalname,
        //   filepath: req.file.destination,
        // const avatar = spawn('D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\avatar_sdk_full_body_standalone.exe',['D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\images\\photo1.jpg','D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\model','D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\resources','-computationParams','D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\parameters\\parameters.json','-exportParams','D:\\Oyna Cloud React\\Oyna Cloud Manager\\server\\src\\avatar_sdk_full_body_standalone_3.0.2\\parameters\\exportparameters.json']);
        const avatar = spawn(process.env.Avatar_EXE, [weight,image, hairstyle,desPath]);
        avatar.stdout.on('data', (data) => {
          console.log('stdout:', data);
        });
  
        avatar.stderr.on('data', (data) => {
          console.error('HERE STDERR:', data.toString());
        });
  
        avatar.on('close', (code) => {
          console.log('Child Process Exited with Code', code);
          console.log('Request Id:', req.params.id);

          var stat = fs.statSync(desPath+'/model.zip');

          res.writeHead(200, {
              'Content-Type': 'application/zip',
              'Content-Length': stat.size
          });
          
          var readStream = fs.createReadStream(desPath+'/model.zip');
          // We replaced all the event handlers with a simple call to readStream.pipe()
          readStream.pipe(res);
         console.log("delete",image);
          fs.unlinkSync(image);
          console.log("delete",image);
          fs.readdir(desPath, (err, files) => {
            if (err) throw err;
          
            for (const file of files) {
              fs.unlink(path.join(desPath, file), err => {
                if (err) throw err;
              });
            }
          });
          // fs.rmdirSync(desPath);
            //  res.download(desPath+'/model.zip', "model.zip", function (err) {
      // if (err) {
      //   // Handle error, but keep in mind the response may be partially-sent
      //   // so check res.headersSent
      // } else {


        // var pslog = new oynadb.ProcessLog({
        //   userid: req.user._id,
        //   name: req.user.name,
        //   store: req.user.store,
        //   processType: "AvatarGeneration",
        //   result: "Avatar Generated",
        // });
        // pslog.save();
        //     oynadb.User.findOneAndUpdate({_id :req.user._id}, {$inc : {'avatarGenerated' : 1}}).exec();
        //     var avatarLog = new  oynadb.AvatarGeneration({
        //       userid: req.user._id
        //     });
        //     avatarLog.save();
           
      // }
    })
         // res.status(200).json({ Sucess: true });
        // });
    }
    catch(e){
        return res.status(404).json({
            err: e.message
        })
    }

  });
}
    
);
/**
 * 
* @function
* @author Muthu G & Balaji K
* @name All_File_list
* @description It will getting all File list
* @param {String} name - Url of allfiles
*/
router.post(
  "/allfiles",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    if (!gfs) {
      // res.send("Error occured to connect to DB")
      // process.exit(0);
    }
    gfs.find().toArray((err, files) => {
      if (!files || files.length === 0) {
      //  res.status(500).json({ Sucess: false, err: err });
      } else {
      }
    });
    oynadb.File.find({}, function (err, result) {
      if (err) {
        res.status(500).json({ Sucess: false, err: err });
      } else {
        res.send(result);
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name All_Branch_list
* @description It will getting all Branch list of Client
* @param {String} name - User's store
*/
router.get(
  "/Allbranches",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    //let people = oynadb.User.findOne({ username: req.session.passport.user.username });// ['geddy', 'neil', 'alex'];
    oynadb.Branch.find({ store: req.user.store }, function (err, result) {
      if (err) {
        res.status(500).json({ Sucess: false, err: err });
      } else {
        res.send(result);
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name All_Branch_list_New
* @description It will getting all Branch list of Client
* @param {String} name -Useer's store
*/
router.post(
  "/Allbranchesnew",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    var dns = [],
      dbs = [];
    oynadb.Flow.find({ sourcenode: req.body.userid }, function (err, flow) {
      if (flow.length === 0) {
        res.status(500).json({ Sucess: false, err: "Not having flows" });
      } else {
        flow.forEach((item, i) => {
          item.destinationnodes.forEach((dnode, i) => {
            dns.push({ user: dnode.user, id: dnode.id });
          });
          dbs = item.destinationbranches;

          oynadb.Branch.find({ store: req.user.store }, function (err, result) {
            if (err) {
              res.status(500).json({ Sucess: false, err: err });
            } else {
              res.send({ r: result, dn: dns, db: dbs });
            }
          });
        });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name All_Messages
* @description It will getting all Messages of all process
* @param {String} name -
*/
router.get(
  "/AllMessages",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.ProcessLog.find({}, function (err, result) {
      if (err) {
        res.status(500).json({ Sucess: false, err: err });
      } else {
        res.send(result);
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Delete_Message
* @description It will delete the particular message
* @param {String} id - message id
*/
router.post(
  "/deletemessage",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log(req.body);
    oynadb.ProcessLog.deleteOne({ _id: req.body.id }, function (err) {
      if (!err) {
        res.json({ sucess: true });
      } else {
        res.status(500).json({ Sucess: false, err: err });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Delete_User
* @description It will delete the particular User
* @param {String} Id - user Id
*/
router.post(
  "/deleteuser",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.User.deleteOne({ _id: req.body.id }, function (err) {
      if (!err) {
        console.log("delete");
        var pslog = new oynadb.ProcessLog({
          userid: req.user._id,
          name: req.user.name,
          store: req.user.store,
          processType: " Node Delete",
          result: "Node is Deleted" + req.body.id,
        });
        pslog.save();
        res.json({ sucess: true });
      } else {
        res.status(500).json({ Sucess: false, err: err });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Add_User
* @description It will add new user based on requested file
* @param {String} File - Requested File from Oyna Application
*/
router.post(
  "/adduser",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("req.body.image");
    var text = req.body.reqfile;
    console.log("req.body.image",req.body);
    var buf = Buffer.from(text, "base64");
    var key = Buffer.from(process.env.LICREQ_DECRP_KEY, "utf8");
    var iv = buf.slice(0, 16);
    var crypt = buf;
    var decipher = crypto.createDecipheriv("aes-128-cbc", key, key);
    var dec = decipher.update(crypt, "base64", "utf-8");
    dec += decipher.final("utf-8");
    var str = dec;
    var result = str.split("$");
    var clientInfo;
    if (result.length === 2) {
      var clientUUID = result[0];
      clientInfo = result[1].split("_");
      var uid = result[0];
      var storename = clientInfo[0];
      var branch = clientInfo[1];
      var nodeid = clientInfo[2];
      var variant = clientInfo[3];

      var uuidSplit = clientUUID.split("-");
      var pwd = uuidSplit[0] + clientInfo[2];
      var licStr = dec + "$" + nodeid + "$" + pwd;

      var bufLic = Buffer.from(licStr, "base64");
      var enckey = Buffer.from(process.env.LIC_ENCRP_KEY, "utf8");

      var cryptLic = bufLic;
      var cipher = crypto.createCipheriv("aes-128-cbc", enckey, enckey);

      var lic = cipher.update(licStr, "utf8", "base64");
      lic += cipher.final("base64");

      const salthash = utils.genPassword(pwd);
      var newuser = new oynadb.User({
        username: storename + "_" + branch + "_" + nodeid,
        name: storename,
        store: storename,
        branch: req.body.branchid,
        role: "client",
        apptype: variant,
        hash: salthash.hash,
        salt: salthash.salt,
      });

      newuser.save().then((user) => {
        var bruser = { user: user._id };
        oynadb.Branch.updateOne(
          { _id: ObjectId(req.body.branchid) },
          { $push: { branchUsers: bruser } },
          (err, info) => {
            if (err) {
              res.status(500).json({ Sucess: false, err: err });
            } else if (info) {
              var newLic = new oynadb.UserLicense({
                id: user._id,
                uuid: clientUUID,
                store: storename,
                branch: req.body.branchid,
                licensekey: lic,
                apptype: variant,
              });
              newLic.save();
              var pslog = new oynadb.ProcessLog({
                userid: req.user._id,
                name: req.user.name,
                store: req.user.store,
                processType: "New Node",
                result: "New Node is Added" + user.name,
              });
              pslog.save();
              res.status(200).json({ sucess: true, user: user });
              console.log("hitt");
            }
          }
        );
      });
    }
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Add_client
* @description It will add New client
* @param {String} Id - from super Admin Account
*/
router.post(
  "/addclient",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    const salthash = utils.genPassword(req.body.password);
    var newuser = new oynadb.User({
      username: req.body.username,
      name: req.body.name,
      store: req.body.name,
      branch: "",
      role: "Admin",
      apptype: "All",
      hash: salthash.hash,
      salt: salthash.salt,
    });
    newuser.save().then((user) => {
      var bruser = { user: user._id };
      oynadb.Branch.updateOne(
        { _id: ObjectId(req.body.branchid) },
        { $push: { branchUsers: bruser } },
        (err, info) => {
          if (err) {
            res.status(500).json({ Sucess: false, err: err });
          } else if (info) {
            console.log(info);
            res.status(200).json({ sucess: true, user: user });
          }
        }
      );
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Branch_User_List
* @description It will get all users from the branch
* @param {String} BranchId - branch id
*/
router.get(
  "/branch/:id",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.User.find(
      { store: req.user.store, branch: req.params.id },
      function (err, result) {
        if (err) {
          res.status(500).json({ Sucess: false, err: err });
        } else {
          res.render("branch", {
            users: result,
            branchid: req.params.id,
          });
        }
      }
    );
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name User_Details
* @description It will get the details about the user
* @param {String} userid - User id
*/
router.get(
  "/users/:id",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.User.find(
      { store: req.user.store, branch: req.params.id },
      function (err, result) {
        if (err) {
          res.status(500).json({ Sucess: false, err: err });
        } else {
          res.render("Users", {
            users: result,
            branchid: req.params.id,
          });
        }
      }
    );
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Add_flow
* @description It will add new flow for the user
* @param {String} sourceId - user node id
* @param {Array< String>} destinationnodes - destination nodes
* @param {String} destinationBranch - destination Branches
*/
router.post(
  "/addflow",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.Flow.find({ sourcenode: req.body.sourceId }, function (err, item) {
      if (item.length === 0) {
        var newFlow = new oynadb.Flow({
          sourcenode: req.body.sourceId,
          destinationnodes: req.body.destinationId,
          destinationbranches: req.body.destinationBranch,
        });
        newFlow.save();
      } else {
        oynadb.Flow.deleteOne({ sourcenode: req.body.sourceId }, function (
          err,
          item
        ) {
          if (!err) {
            var newFlow = new oynadb.Flow({
              sourcenode: req.body.sourceId,
              destinationnodes: req.body.destinationId,
              destinationbranches: req.body.destinationBranch,
            });
            newFlow.save();
          res.status(200).json({ Sucess: true });
          }
        });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_Users
* @description It will get all user list in branch
* @param {String} branchid - Branch ID
*/
router.post(
  "/GetUsers",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.Branch.findById(ObjectId(req.body.branchid))
      .then((doc) => {
        let usersList = new Array();
        var array2 = [];
        doc.branchUsers.forEach(function (stringId) {
          array2.push(new ObjectId(stringId.user));
        });
        oynadb.User.find({ _id: { $in: array2 } }, function (err, result) {
          if (err) {
            res.status(500).json({ Sucess: false, err: err });
          } else {
            res.send(result);
          }
        });
      })
      .catch((err) => {
        res.status(500).json({ Sucess: false, err: err });
      });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_User_Info
* @description It will get user License File
* @param {String} ID - User ID
*/
router.post(
  "/GetUserInfo",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.UserLicense.find({ id: req.body.branchid })
      .then((doc) => {
        let usersList = new Array();
        var array2 = [];
        res.send(doc);
      })
      .catch((err) => {
        res.status(500).json({ Sucess: false, err: err });
      });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_Users_License
* @description It will get all user License File
* @param {String} ID - User ID
*/
router.post(
  "/GetUsersLicense",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.UserLicense.find({ id: req.body.userid })
      .then((doc) => {
        let usersList = new Array();
        var array2 = [];
        var pslog = new oynadb.ProcessLog({
          userid: req.user._id,
          name: req.user.name,
          store: req.user.store,
          processType: " UserLicense Download",
          result: "License Has downloaded for" + req.body.userid,
        });
        pslog.save();
        res.send({ lickey: doc[0].licensekey.toString() });
      })
      .catch((err) => {
        res.status(500).json({ Sucess: false, err: err });
      });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_Pending_File_List
* @description It will get all pending file lists for that user
* @param {String} ID - User ID
*/
router.post(
  "/GetPendingFileList",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.File.find({ "assigned.id": req.user._id }, function (err, result) {
      if (err) res.status(500).json({ Sucess: false, err: err });
      else {
        {
          res.send({ result: result });
        }
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_All_clients
* @description It will get all client Accounts
* @param {String} ID - User ID
*/
router.get(
  "/AllStores",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.User.find({ role: "Admin" }, function (err, result) {
      if (err) {
        res.status(500).json({ Sucess: false, err: err });
      } else {
        res.send(result);
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Register
* @description It will register new account
* @param {String} url - User ID
*/
// router.get('/', (req,res) =>{
//   res.sendFile(path.join(__dirname, "client", "index.html"));
// });
// router.use('/oyna', require('./oyna'));
// router.get("/oyna", (req, res) => {
//   res.render("register", { people: people });
//   // res.sendFile(path.join(__dirname, "client1", "index.html"));
//  });

router.get("/register", function (req, res) {
  let people = ["geddy", "neil", "alex"];
  res.render("register", { people: people });
});
/**
* @function
* @author Muthu G & Balaji K
* @name Login
* @description It will login user
* @param {String} username - User name
* @param {String} password - password
*/
router.post("/login", function (req, res) {
  const { username, password } = req.body;

  oynadb.User.findOne({ username: req.body.username }).then((user) => {
    if (!user) {
      res.status(401).json({ sucess: false, msg: "coudn't find user" });

    }
    else {
      const isvalid = utils.validPassword(
        req.body.password,
        user.hash,
        user.salt
      );
      if (isvalid) {
        const tokenobj = utils.issueJWT(user);
        req.headers.authorization = tokenobj.token;
        res.setHeader("Authorization", tokenobj.token);
        res.header("Authorization", tokenobj.token);
        var pslog = new oynadb.ProcessLog({
          userid: user._id,
          name: user.name,
          store: user.store,
          processType: " Login",
          result: " Login is Sucess",
        });
        pslog.save();
        res.status(200).json({
          sucess: true,
          token: tokenobj.token,
          expiresIN: tokenobj.expires,
          role: user.role,
        });
      }
      else {
          res.status(401).json({ sucess: false, msg: "Password Is Not Correct" });
      }
    }

  });
});
/**
* @function
* @author Muthu G & Balaji K
* @name Logout
* @description It will logout user

*/
router.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});
/**
* @function
* @author Muthu G & Balaji K
* @name Register_user
* @description It will add new user
* @param {String} username - User name
*/
router.post("/register", function (req, res) {
  console.log(req.body.password);
  const salthash = utils.genPassword(req.body.password);
  console.log(salthash.salt);
  var newuser = new oynadb.User({
    username: req.body.username,
    name: req.body.name,
    store: req.body.store,
    branch: req.body.branch,
    role: req.body.role,
    hash: salthash.hash,
    salt: salthash.salt,
  });
  newuser.save().then((user) => {
    const jwt = utils.issueJWT(user);
    console.log({
      sucess: true,
      user: user,
      token: jwt.token,
      expiresIN: jwt.expires,
    });
    res.json({
      sucess: true,
      user: user,
      token: jwt.token,
      expiresIN: jwt.expires,
    });
  });
});
/**
* @function
* @author Muthu G & Balaji K
* @name Add_Branch
* @description It will add new branch
* @param {String} name - User name
* @param {String} addressline1 - address
* @param {String} addressline2 -address
* @param {String} state - state
* @param {String} postcode - postcode
* @param {String} country - country
*/
router.post(
  "/addbranch",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    var newbranch = new oynadb.Branch({
      name: req.body.name,
      addressline1: req.body.addressline1,
      addressline2: req.body.addressline2,
      city: req.body.city,
      state: req.body.state,
      postcode: req.body.postcode,
      country: req.body.country,
      store: req.user.store,
    });
    newbranch.save();
    var pslog = new oynadb.ProcessLog({
      userid: req.user._id,
      name: req.user.name,
      store: req.user.store,
      processType: "New Branch",
      result: newbranch.name + " Branch is Added",
    });
    pslog.save();
    res.json({ sucess: true });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Update_Branch
* @description It will  Update branch
* @param {String} name - User name
* @param {String} addressline1 - address
* @param {String} addressline2 -address
* @param {String} state - state
* @param {String} postcode - postcode
* @param {String} country - country
*/
router.post(
  "/updatebranch",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log(req.body);

    oynadb.Branch.deleteOne({ _id: req.body.id }, function (err) {
      if (!err) {
        var newbranch = new oynadb.Branch({
          name: req.body.name,
          addressline1: req.body.addressline1,
          addressline2: req.body.addressline2,
          city: req.body.city,
          state: req.body.state,
          postcode: req.body.postcode,
          country: req.body.country,
          store: req.user.store,
          branchUsers: req.body.branchUsers,
        });
        newbranch.save();
        console.log(newbranch);
        var pslog = new oynadb.ProcessLog({
          userid: req.user._id,
          name: req.user.name,
          store: req.user.store,
          processType: "Update Branch",
          result: newbranch.name + " Branch Is Updated ",
        });
        pslog.save();
        res.json({ sucess: true });
      } else {
        res.status(500).json({ Sucess: false, err: err });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Delete_Branch
* @description It will Delete branch
* @param {String} ID - Branch ID
*/
router.post(
  "/deletebranch",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    oynadb.Branch.findOne({ _id: req.body.id }, function (err, branch) {
      if (branch) {
        console.log(branch);
        branch.branchUsers.forEach((item, i) => {
          console.log();
          oynadb.User.deleteOne({ _id: item.user }, function (err) {
            if (err) {
              res.status(500).json({ Sucess: false, err: err });
            }
          });
        });
        oynadb.Branch.deleteOne({ _id: req.body.id }, function (err) {
          if (!err) {
            var pslog = new oynadb.ProcessLog({
              userid: req.user._id,
              name: req.user.name,
              store: req.user.store,
              processType: "New Branch",
              result: branch.name + "  is Deleted",
            });
            pslog.save();
            res.json({ sucess: true });
          } else {
            res.status(500).json({ Sucess: false, err: err });
          }
        });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Upload_File
* @description It will upload file into db
* @param {String} file -input oyna file
*/
router.post(
  "/uploadfile",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        res.status(500).json({ Sucess: false, err: err });
      } else if (err) {
        res.status(500).json({ Sucess: false, err: err });
      }
      var assignedNodes;

      oynadb.Flow.find({ sourcenode: req.user._id }, function (err, flow) {
        {
          if (flow.length > 0) {
            console.log(flow);
            assignedNodes = flow[0].destinationnodes;
            console.log(flow[0].destinationnodes);
          } else {
            assignedNodes = JSON.parse(req.body.users); //req.body.users;
          }
          var newfile = new oynadb.File({
            fileid: req.file.filename,
            filename: req.file.originalname,
            filepath: req.file.destination,
            store: req.user.store,
            filetype: req.file.mimetype,
            available: true,
            assigned: assignedNodes,
          });
          console.log(newfile);
          newfile.save();
          var pslog = new oynadb.ProcessLog({
            userid: req.user._id,
            name: req.user.name,
            store: req.user.store,
            processType: "New File Upload",
            result: newfile.filename + "  is Uploaded",
          });
          pslog.save();
          res.json({ sucess: true });
        }
      });
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Delete_File
* @description It will Delete File
* @param {String} ID - File Id
*/
router.post(
  "/deletefile",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log(req.body.path);
    oynadb.File.findOne({ _id: req.body.id }, function (err, file) {
      if (file) {
        gfs.find({ filename: file.fileid }).toArray((err, files) => {
          if (!files || files.length === 0) {
            return res.status(404).json({
              err: "No such file exist",
            });
          }
          console.log("del");
          console.log(files[0]._id);
          gfs.delete(mongoose.Types.ObjectId(files[0]._id), (err, res2) => {
            if (err) {
              res.status(500).json({ Sucess: false, err: err });
            } else {
              oynadb.File.deleteOne({ _id: req.body.id }, function (err) {
                if (!err) {
                  console.log("delete");
                  var pslog = new oynadb.ProcessLog({
                    userid: req.user._id,
                    name: req.user.name,
                    store: req.user.store,
                    processType: " File Delete",
                    result: files[0].filename + "  is Deleted File",
                  });
                  pslog.save();
                  res.json({ sucess: true });
                } else {
                }
              });
            }
          });
        });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Download_File
* @description It will Download File
* @param {String} ID - File ID
*/
router.get(
  "/download_File/:id",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    console.log("Request Id:", req.params.id);
    oynadb.File.findOne({ fileid: req.params.id }, function (err, file) {
      if (file) {
        const file3 = gfs
          .find({ filename: req.params.id })
          .toArray((err, files) => {
            if (!files || files.length === 0) {
              return res.status(404).json({
                err: "No such file exist",
              });
            }
            console.log(files);
            var pslog = new oynadb.ProcessLog({
              userid: req.user._id,
              name: req.user.name,
              store: req.user.store,
              processType: " File Download",
              result: file.filename + "  is Downloaded File",
            });
            pslog.save();
            gfs.openDownloadStreamByName(req.params.id).pipe(res);
            if (
              file.delivered.filter((e) => e.user === req.user.name).length ===
              0
            ) {
              var consumer = { user: req.user.name, id: req.user._id };
              console.log(consumer);
              oynadb.File.updateOne(
                { fileid: req.params.id },
                { $push: { delivered: consumer } },
                (err, info) => {
                  if (err) {
                    res.status(500).json({ Sucess: false, err: err });
                  } else {
                    if (info) {
                    } else {
                    }
                  }
                }
              );
            }
          });
      }
    });
  }
);
/**
* @function
* @author Muthu G & Balaji K
* @name Get_Role
* @description It will Get role of the user
* @param {String} ID -user id
*/
router.post(
  "/Getrole",
  passport.authenticate("jwt", { session: false }),
  function (req, res) {
    res.json({ sucess: true, role: req.user.role });
  }
);

/**
* @function
* @author MathanKumar M
* @name Testing
* @description It will run the command prompt
* @param None
*/


module.exports ={
  router
  
};