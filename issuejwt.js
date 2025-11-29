
const crypto =require('crypto');
const signatureFunction=crypto.createSign('RSA-SHA256');
const fs=require('fs');
const headerobj ={
  alg:'RS256',
  type:'JWT'
};
const payloadObj={
  sub:'oyna@$1650',
  name:'oyna',
  admin:true,
  iat:15162239022
};

const headerobjstring =JSON.stringify(headerobj);
const payloadObjstring=JSON.stringify(payloadObj);

const base64urlheader =headerobjstring.toString('base64');
const base64urlpayload =payloadObjstring.toString('base64');

signatureFunction.write(base64urlheader+'.'+base64urlpayload);
signatureFunction.end();

const PRIV_KEY =fs.readFileSync(__dirname+'/priv_key.pem','utf8');
console.log(PRIV_KEY);
const signatureBase64=signatureFunction.sign(PRIV_KEY,'base64');

console.log(signatureBase64);
// const { generateKeyPairSync } = require('crypto');
// const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//   modulusLength: 4096,  // the length of your key in bits
//   publicKeyEncoding: {
//     type: 'spki',       // recommended to be 'spki' by the Node.js docs
//     format: 'pem'
//   },
//   privateKeyEncoding: {
//     type: 'pkcs8',      // recommended to be 'pkcs8' by the Node.js docs
//     format: 'pem',
//     cipher: 'aes-256-cbc',   // *optional*
//     passphrase: 'oyna$$1650' // *optional*
//   }
// });
