const express = require('express')
const fs = require('fs')
var path = require('path');
var jwt = require('jsonwebtoken');

var privateKey = fs.readFileSync('pem/privkey.pem');
var publicKey = fs.readFileSync('pem/pubkey.pem');

var bodyParser = require('body-parser');


///
/*

User account Management

Create an account
Username
Password
name
publicKey

Sign Up Procedure
No username and password.
Either you provide a Public key or a Pair is generated and given to you.
An alias is generated which accelerates login but is not required.



Login procedure
You sign something with your private key. This gives you a login token.
Remcasts validates your signature against the public key on file
Remcasts provides you a JWT for X amount of time
You can now use the services you're entitled to during that time period
SSH Key Authentication









// function generateToken(req, res, next) {
//     // custom middleware here...

//     var payload = {
//         exp: Math.floor(Date.now() / 1000) + (60 * 60),
//         iss:"remcasts.com",
//         sub:"remcast.studio",
//         admin:false
//     }


//     var token = jwt.sign(payload, privateKey, { algorithm: 'RS256'});
//     console.log(token)
    
    
//     next();
// }




// const validateToken = () => {
//     return (req, res, next) => {




//     // verify a token asymmetric
//     jwt.verify(token, publicKey, function(err, decoded) {
//         if(err)
//         {
//             console.log("Error:", err) ;
//             res.send(401, "Unauthorized");

//         }

//         if(decoded)
//         {
//             console.log("Decoded:", decoded)  
//             next();

//         }

//     })
//     }
//   }


const extractToken = (req,res,next) =>
{
    let token = req.headers['x-access-token'] || req.headers['authorization'];
  //  console.log(token) 
    // Express headers are auto converted to lowercase
    if(token)
    {
        if (token.startsWith('Bearer ')) {
        // Remove Bearer from string
        token = token.slice(7, token.length).trimLeft();
        }
        if (token) {
            req.token = token;
            next();
        }
        else
        {
            res.status(401).send( "Sorry dude, it needs to be a Bearer token");
        }
    }
    else
    {
        res.status(401).send( "Sorry dude, need a token");
    }

}




//use this for audit logging 
const LoggerMiddleware = (req,res,next) =>{
    console.log(`Logged  ${req.url}  ${req.method} -- ${new Date()}`);
 //   console.log(req.header('authorization'));
    next();
}


// function validateToken(req, res, next) {
// // custom middleware here...


//     // verify a token asymmetric
//     jwt.verify(token, publicKey, function(err, decoded) {
//         if(err)
//         {
//             console.log("Error:", err) ;
//             res.send(401, "Unauthorized");

//         }

//         if(decoded)
//         {
//             console.log("Decoded:", decoded)  
//             next();

//         }
//     });




// }

module.exports={
    LoggerMiddleware,extractToken
//generateToken
}