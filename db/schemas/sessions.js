var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

//this is for an object that was modified. For example an audio file that was edited down from the source
var sessionSchema = new mongoose.Schema({

    requestToken:String,
    alias:String,
    publicKey:String, //it is redundant to keep this here, but might make things easier whenever the PubKey is needed
    signature64:String, //the signature that was returned in base64
    momentCreated:Date, //the moment the session was created
    momentValidated:Date, // the moment the session was validated through verification of the signature
    momentDeleted:Date, //the moment the session was deleted

    jwt:{}, //the JWT associated with the session
    jwtDecoded:{}, //the JWT associated with the session

    //misc fields for rate limiting.
    ipAddress:String, 

},{ _id : true });

module.exports ={
    sessionSchema,
};
