const express = require('express')
const fs = require('fs')
var path = require('path');
var jwt = require('jsonwebtoken');

//keys for jwt functions. Public key is used to verify that the payload has not been altered
const paxxagePrivatePem = fs.readFileSync(process.env.PAXXAGEPRIVATE, 'utf8');
const paxxagePublicPem =  fs.readFileSync(process.env.PAXXAGEPUBLIC, 'utf8');

var bodyParser = require('body-parser');

//jwt verification middlware functions
var session = function(req, res, next) {
    var authorization = req.headers.authorization;
    console.log("authorization :", authorization)
    
    try{
        var token = authorization.split('Bearer ')[1]; //split off the word Bearer
        console.log("token :", token)
        if(token.length)
        {
            var verified = jwt.verify(token, paxxagePublicPem);
            
            //TODO Do a simple database verification to ensure that the JWT is also the same as the DB and that the session is still valid there.
            if(verified)
            {
                req.features = verified.features;
                next();
            }
            else
            {
                res.status(401).send({code:-1, message:"Unauthorized request. Bearer token is invalid."});
            }
        }
        else
        {
            res.status(401).send({code:-1, message:"Unauthorized request. No Bearer token."});
        }

    }
    catch(e)
    {
        console.log("No token found!", e);
        res.status(401).send({code:-1, message:"Unauthorized request. No Bearer token."});
    }

}

//Testing functions to validate middleware functionality
// function logger(req, res, next) {
//     console.log("I am the logger");
//     next();
// }


// var requestTime = function (req, res, next) {
//     req.requestTime = Date.now()
//     next()
//   }


module.exports={session}



