//express and node
const express = require('express')
const app = express()

//Helmet to manage the headers that are returned. This helps to eliminate leaky headers.
const helmet = require('helmet')
app.use(helmet())

//port or env variable
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

//static sites
app.use(express.static('public')); 
app.use(express.static('public/forge')); 
//enable listening to the port
app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))


//routes and valls
app.get('/', express.static(path.join(__dirname, '/public')))

//A sample signin page to demonstrate how Paxxage-based signin works
var signin = require('./routes/signin');
app.use('/signin/', signin); 

// app.get("/users", function(req, res) {
//     res.status(200).send( "Okay, validated")
//   });

