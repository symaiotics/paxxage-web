var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

  
//this is for an object that was modified. For example an audio file that was edited down from the source
var accountSchema = new mongoose.Schema({

    alias:String,
    publicKey:String,
    momentCreated:Date, //the moment the account was created
    momentDeleted:Date, //the moment the account was deleted
 
},{ _id : true });



module.exports ={
    accountSchema,
};
