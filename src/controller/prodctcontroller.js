"use strict";
var express = require("express");
var router = express.Router();
var oynadb = require("../db_model");
const passport = require("passport");
const fs = require("fs");
var multer = require("multer");
const GridFsStorage = require("multer-gridfs-storage");
const crypto = require("crypto");
const path = require("path");
const mongoURI = "mongodb://localhost:27017/oyna_cloud";
const mongoose = require("mongoose");
// const {gfs2} =require("../index")
const DefaultTypes = {
  shirt: {
    shirt:'shirt_shirt',
    pant:'shirt_pant',
  },
  sherwani: {
    shirt:'sherwani_shirt',
    pant:'sherwani_pant',
    shawl:'sherwani_shawl',
  },
  suit: {
    shirt:'suit_shirt',
    pant:'suit_pant',
    coat:'suit_coat',
  },
};

const conn = mongoose.createConnection(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
let gfs2
 conn.once("open", () => {
   
  gfs2 = new mongoose.mongo.GridFSBucket(conn.db, {
    bucketName: "productfiles",
  });
});
const createDefaultCategories =async function(store){

    for (const [type, value] of Object.entries(DefaultTypes)) {
      
    var newproducttype = new oynadb.ProductType({
      name: type,
      store: store,
    })
    newproducttype.save();
    for (const [cate, catvalue] of Object.entries(value)) {
      var newproductcatlog = new oynadb.ProductCatlog({
        name: catvalue,
        type:newproducttype._id,
        store: store,
      })
      newproductcatlog.save();
    }
    }
}
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
          bucketName: "productfiles",
        };
        resolve(fileInfo);
      });
    });
  },
});

const upload = multer({
  storage,
})

router.post("/addproduct", passport.authenticate("jwt", { session: false }), async function (req, res) {
  const { name, qr, quantity, price, images, fileCount } = req.body;
  upload.array('images', req.body.fileCount)(req, res, async function (err) {
    if (err instanceof multer.MulterError) {
      res.status(500).json({ Sucess: false, err: err });
    } else if (err) {
      res.status(500).json({ Sucess: false, err: err });
    }
    else {

    }
  
    console.log(req.body);
    let filesImages = req.files.map(item => ({ filename: item.filename, originalname: item.originalname }));//.map(o => {_id: o.id});
    // console.log(filesImages);
    var newproduct = new oynadb.Product({
      qr:req.body.qr,
      name: req.body.name,
      price: req.body.price,
      quantity: req.body.quantity,
      type: 'saree',
      show: true,
      store: req.user.store,
      images: filesImages,
      origin: req.body.origin,
      category:req.body.category 
    })
    newproduct.save();
    const dataq = await oynadb.Product.findOne({ _id: newproduct._id });
    res.status(200).json({ data: dataq });

  });
  //
  // console.log(req.body);
  // res.json({Sucess:true})
});



router.get(
  "/get_File/:id", passport.authenticate("jwt", { session: false }),
  function (req, res) {

    const { filename } = req.body;
    console.log("inside data", req.params.id);
    gfs2.openDownloadStreamByName(req.params.id).pipe(res);

  })
  router.get(
    "/get_File_Node/:id", passport.authenticate("jwt", { session: false }),
    function (req, res) {
  
      const { filename } = req.body;
      console.log("inside data", req.params.id);
      gfs2.openDownloadStreamByName(req.params.id).pipe(res);
  
    })
    router.post(
      "/prduct_recieved", passport.authenticate("jwt", { session: false }),
      async function (req, res) {
        // const collection = conn.db.collection('productfiles.files');    
        // const collectionChunks = conn.db.collection('productfiles.chunks');
        const { products=[] } = req.body;
        console.log(req.body,req.body.products);
        const nodesyncExists = await oynadb.NodeSync.findOne({user_id: req.user._id});
        if(!nodesyncExists){
          var nodesy  =new oynadb.NodeSync({
            user_id: req.user._id,
            syncfiles: req.body.products,
          })
          nodesy.save();
          res.status(200).json(nodesy);
        }
        else{
          const nodesync = await oynadb.NodeSync.update(
            { user_id: req.user._id }, 
            { $push: { syncfiles: req.body.products } }
        );
             res.status(200).json(nodesync);
        }

    })

    router.get(
    "/get_all_products/:origin", passport.authenticate("jwt", { session: false }),
    async function (req, res) {
      console.log("Request",req)
      const { origin } = req.params;
      const { filename } = req.body;
      if (origin === "all"){
        const allfiles = await oynadb.Product.find({
          store: req.user.store
        }).populate('category');
        return res.status(200).json(allfiles);
      }
      console.log("inside data", req.user.store);
      const allfiles = await oynadb.Product.find({
        store: req.user.store, origin: origin
      }).populate('category')
      //const allfiles = await oynadb.Product.find({ store: req.user.store }).populate('category')
      res.status(200).json(allfiles);
    })

    router.post(
  "/get_images", passport.authenticate("jwt", { session: false }),
  async function (req, res) {
    // const collection = conn.db.collection('productfiles.files');    
    // const collectionChunks = conn.db.collection('productfiles.chunks');
    const { fileids=[] } = req.body;
    console.log(req.body,req.body.fileids);
    // const allfiles = await oynadb.Product.find({ store: req.user.store })
    if(req.body,req.body.fileids ===undefined) return     res.status(200).json([]);
    else if(req.body,req.body.fileids.length===0)return     res.status(200).json([]);
    else{

  
  let filedata=[];
    for(let ind=0;ind<req.body.fileids.length;ind++){
      const docse =await oynadb.ProductFiles.find({filename: req.body.fileids[ind]})
      const chunks =await   oynadb.ProductFilesChunks.find({files_id : docse[0]?._id}).sort({n: 1}).exec()

     let fileData = []; 
     for(let i=0; i<chunks.length;i++){            
      //This is in Binary JSON or BSON format, which is stored               
      //in fileData array in base64 endocoded string format               
      fileData.push(chunks[i].data.toString('base64'));          
    }
        
     let finalFile = 'data:' + docse[0]?.contentType + ';base64,' 
          + fileData.join('');          
          filedata.push({
            img:finalFile,
            filename:req.body.fileids[ind]
          })
    }
   
       res.status(200).json(filedata);
      }
  })

router.post("/delete-product", passport.authenticate("jwt", { session: false }), 
    async function(req, res){
      console.log("req.body.fileids",req.body);
      console.log("req.body.fileids",req.body.fileids);
      if (req.body, req.body.fileids === undefined){
         console.log("Undefined return");
         return res.status(200).json([]);
      }
      else{
        console.log("Process Start");
        for(let ind=0;ind<req.body.fileids.length;ind++){
          const docs =await oynadb.ProductFiles.find({filename: req.body.fileids[ind]})
          const chunks = await oynadb.ProductFilesChunks.deleteMany({files_ids: req.body._id});
          await oynadb.ProductFiles.deleteMany({ filename: req.body.fileids[ind] });
        }
        const dataq = await oynadb.Product.deleteOne({ _id:req.body._id});

        res.status(200).json([{"sucess" : "sucess"}]);
      }
})

router.post("/update-products", passport.authenticate("jwt", { session : false }),
    async function(req, res) {
    if (req.body === undefined){
       console.log("Undefined return");
        return res.status(200).json([]);
    }
    else{
       try{
       console.log("Process Start");
       console.log("Body", req.body);
       const filter = { _id: req.body.fileid };
       console.log("filter",filter)
       const update = { qr: req.body.qr, name : req.body.name, price: req.body.price, quantity: req.body.quantity,category:req.body.category };
      //  var newproduct = new oynadb.Product({
      //   qr:req.body.qr,
      //   name: req.body.name,
      //   price: req.body.price,
      //   quantity: req.body.quantity,
      //   type: 'saree',
      //   show: true,
      //   store: req.user.store,
      //   images: filesImages
      // })
       let doc = await oynadb.Product.findOneAndUpdate(filter, update);
       console.log(doc);
       return res.status(200).json([{"data": doc}]);
       }
       catch(e){
        return res.status(400).json([{"data": doc}]);
       }
        // for(let ind=0;ind<req.body.fileids.length;ind++){
        //    const docs =await oynadb.ProductFiles.find({filename: req.body.fileids[ind]})
        //    const chunks = await oynadb.ProductFilesChunks.deleteMany({files_ids: req.body._id});
        //    await oynadb.ProductFiles.deleteMany({ filename: req.body.fileids[ind] });
        // }
    } 
})

router.get('/gettype/:_id', passport.authenticate("jwt", { session: false }), async function name(req, res) {
    const { _id } = req.params
    console.log("_id",_id)
    let type = await oynadb.ProductType.find({ store: req.user.store, _id: _id })
    res.status(200).json(type);
})

router.get("/alltype/:origin", passport.authenticate("jwt", { session: false }), async function (req, res) {
  const { origin } = req.params
  let allfiles = await oynadb.ProductType.find({ store: req.user.store})
  if(allfiles.length<3){
    await createDefaultCategories(req.user.store )
    allfiles = await oynadb.ProductType.find({ store: req.user.store })
  }
  
  res.status(200).json(allfiles);
});
router.post("/addtype", passport.authenticate("jwt", { session: false }), async function (req, res) {

    var newproducttype = new oynadb.ProductType({
      name: req.body.name,
      store: req.user.store,
    })
    newproducttype.save();
    res.status(200).json({ data: newproducttype });

});
router.post("/updatetype", passport.authenticate("jwt", { session: false }), async function (req, res) {
  
  let doc = await oynadb.ProductType.findOneAndUpdate({_id: req.body._id}, {name: req.body.name});
  return res.status(200).json([{"data": doc}]);
});
router.post("/deletetype", passport.authenticate("jwt", { session: false }), async function (req, res) {  
  try {
    const dataq = await oynadb.ProductType.deleteOne({ _id:req.body._id});

    res.status(200).json([{"success" : "success"}]);    
  } catch (error) {
    res.status(400).json([{"failed": error.message}]);
  }

});

router.post("/category", passport.authenticate("jwt", { session: false }), async function (req, res) {
  const allfiles = await oynadb.ProductCatlog.find({ type: req.body._id }).
  populate('type')
  res.status(200).json(allfiles);
});
router.post("/addcategory", passport.authenticate("jwt", { session: false }), async function (req, res) {

  var newproductcatlog = new oynadb.ProductCatlog({
    name: req.body.name,
    type:req.body.type,
    store: req.user.store,
  })
  newproductcatlog.save();
  res.status(200).json({ data: newproductcatlog });

});
router.post("/updatecategory", passport.authenticate("jwt", { session: false }), async function (req, res) {

let doc = await oynadb.ProductCatlog.findOneAndUpdate({_id: req.body._id}, {name: req.body.name});
return res.status(200).json([{"data": doc}]);
});
router.post("/deletecategory", passport.authenticate("jwt", { session: false }), async function (req, res) {  
const dataq = await oynadb.ProductCatlog.deleteOne({ _id:req.body._id});

res.status(200).json([{"sucess" : "sucess"}]);
});


router.get("/sync-node", passport.authenticate("jwt", { session: false }), async function (req, res) {
  const allfiles = await oynadb.Product.find({ store: req.user.store }).populate('category');
  try{
    const nodeSync = await oynadb.NodeSync.findOne({ user_id: req.user._id });
  
    var yettosync= allfiles.filter((item)=>!nodeSync.syncfiles.includes(item._id))
  
  
    
    res.status(200).json(yettosync);
  }
  catch{
    res.status(200).json(allfiles);
  }

});

module.exports = router;