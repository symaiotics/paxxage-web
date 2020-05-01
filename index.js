//express and node
const express = require('express')
const app = express()
var port = process.env.PORT || 3001;

//libraries
const fs = require('fs')
var path = require('path');
var jwt = require('jsonwebtoken');

//library middleare
var bodyParser = require('body-parser');
//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))
//To parse json data
app.use(bodyParser.json())


//custom middleware
// var extractToken = require('./middleware/validation').extractToken;
// app.use(extractToken);
// var LoggerMiddleware = require('./middleware/validation').LoggerMiddleware;
// app.use(LoggerMiddleware);



//static sites
app.use(express.static('public')); 
app.use(express.static('public/forge')); 
//enable listening to the port
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


//routes and valls
app.get('/', express.static(path.join(__dirname, '/public')))


app.get("/users", function(req, res) {
    res.status(200).send( "Okay, validated")
  });

