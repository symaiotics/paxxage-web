//Mongoose Connection

//mongoose is used with schemas to make queries easier and schema validation a requirement.
//this is not a mongoDB requirement but simply an effective way of working from my own experience
var mongoose = require('mongoose');

let _db;// validate if the db has already been initiated and if so, exit
var url = process.env.PAXXAGEDB; //Connection string is set through system variables
//make sure this system variable is set through your server / hosting configuration

//mongoose options
var options = {
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    useFindAndModify: false};

function initDb(callback) {

    if (_db) {
        console.warn("Trying to init DB again!");
        return callback(null, _db);
    }

    mongoose.connect(url, options, connected);

    function connected(err, db) {
        if (err) {
            console.log(err);
            return callback(err);
        }
        console.log("Connected to MongoDB with the Mongoose Driver");
       // console.log("DB initialized - connected to: " + url);
        _db = db;
        return callback(null, _db);
    }
};


module.exports = {
    initDb,
    mongoose

};
