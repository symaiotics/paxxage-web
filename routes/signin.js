//Note: This is not production-ready code.
    //There are several pieces of middleware not initiated (helmet, logging, access control, rate limiting, etc.)
    //Key management needs to be handled better for larger teams and scalability and a Key Vault service is worth looking into
//This code is simply to demonstrate the necessary steps and loops to establish for a secure signin using RSA signatures
//That being said, if you have enhancements and recommendations, please open a ticket or do a push request.
//I may create a separate branch later for production ready code

//use routers
    var express = require('express');
    var router = express.Router();
//prepare the incoming variables into JSON by default
    bodyParser = require('body-parser');
    router.use(bodyParser.urlencoded({extended: true}));
    router.use(bodyParser.json());

//load Paxxage's pem keys which are used for signing and validating
    var fs = require('fs');
    const path = require("path");

//Load the Public and Private Keys
    const paxxagePrivatePem = fs.readFileSync(process.env.PAXXAGEPRIVATE, 'utf8')
    const paxxagePublicPem =  fs.readFileSync(process.env.PAXXAGEPUBLIC, 'utf8')
    console.log("Loaded the encryption keys for this paxxage service")

//We will be using JSON Web Tokens (JWT) once the session is validated for all future interactions
//A piece of custom middleware will be introduced to valiate the JWT on every call after signin to ensure the session is valid
    var jwt = require('jsonwebtoken');
    var forge = require('node-forge');

//this sample code uses mongoDB as the database for storing public keys, creating sessions, and validating Javascript Web Tokens (JWTs) for each request
//For DEV, a localhost MongoDB Community or a free tier Mongo Atlas can be used
    const mongoose = require("./../db/mongooseDb").mongoose;
    const initDb = require("./../db/mongooseDb").initDb;

//initialize the mongoDB connection through Mongoose
    initDb(function (err) {
        if (err) throw err;
    });

//get the Schemas that we will be using
//sessions are temporary documents to record pending, active, and completed login sessions to a service
//accounts are the Public Key and alias pairs used to validate logins to the system
    const accountSchema = require("../db/schemas/accounts").accountSchema;
    const sessionSchema = require("../db/schemas/sessions").sessionSchema;

//load the nouns and adjectives for aliases
//This method is optimized potentially by adding the results into a database, but I have left it as a FS operation so you can see the logic
//get the nouns
    var nouns = fs.readFileSync(path.resolve(__dirname, "../assets/nouns.txt"), 'utf8');
    var nounArray = nouns.split('\n'); 
    var nounObjArray = [];
    for(var a = 0; a< nounArray.length;a++)
    {
    var thisNounPlural = nounArray[a].split(','); 
    var thisNoun = { singular:thisNounPlural[0], plural:thisNounPlural[1]};
    nounObjArray.push(thisNoun);
    }

    //get the adjectives
    var adjectives = fs.readFileSync(path.resolve(__dirname, "../assets/adjectives.txt"), 'utf8');
    var adjectiveArray = adjectives.toString('utf8').split('\n');  
    
    console.log(1000 * nounObjArray.length * adjectiveArray.length + " possible aliases available.")


//Routes
//generate an alias
    router.get('/alias', async (req, res, next) => {
        var Accounts = mongoose.model('accounts', accountSchema);//

        //Create an alias based on the noun/adjective formula
        var matchingAccountsCount = 1;

        //check for a collission
        //If there is a collision, then generate a new alias as a loop using an await function
        //This is not sustainable on a big system potentially as names slots are consumed. But there are roughly 35 billion aliases available in this randomization scheme
        while (matchingAccountsCount > 0)
        {
            var aliasRandomNumber = getRandomInt(1000);
            var aliasRandomNoun = nounObjArray[getRandomInt(nounObjArray.length-1)];
            var aliasRandomAdjective = adjectiveArray[getRandomInt(adjectiveArray.length-1)];
            var alias = aliasRandomNumber + "." + aliasRandomAdjective +  "." +  (aliasRandomNumber == 1 ?  aliasRandomNoun.singular : aliasRandomNoun.plural) ;
            //remove any new lines or blank spaces from the text. This messes with future queries.
            alias.trim();
            alias.replace(/\r?\n|\r/g, "");
            alias.replace(/\n/g, "");
            //check to see if there is a collision
            matchingAccountsCount = await Accounts.find({alias:alias}).exec().length;
        }

        //Insert the created account
        var newAccount = [{alias:alias, momentCreated: new Date().getTime() }];
        Accounts.insertMany( newAccount ,(error, docs) => {
            if(error)
            {
            console.log(error);
            res.status(500).send("Server Error. Type not specified.");
            }
            res.status(200).send({alias:docs[0].alias});
        });
    });


//create an account by claiming an alias
    router.post('/claim', async (req, res, next) => {

        var Accounts = mongoose.model('accounts', accountSchema);//

        var alias = req.body.alias;
        var publicKey = req.body.publicKey;

        //find me the alias name which has no public key assigned yet and also hasn't been deleted
        var availableAlias = await Accounts.find({alias:alias, publicKey:null, momentDeleted:null}).exec();

        if(availableAlias.length)
        {

            Accounts.updateMany({"_id":availableAlias[0]._id,publicKey:null, momentDeleted:null}, {$set:{publicKey:publicKey}},(error, docs) => 
            {
                if(error)
                {
                console.log(error);
                res.status(500).send({code:-1, message:"Error while claiming alias. Try again."});
                }
                //DEV
                console.log(docs)
                res.status(200).send({code: 1, message:"Alias Successfull Claimed"});
             });

 
        }
        //receive a public key
        //validate the public key strength / length
        //validate the Alias is present in the system but not already used
        //validate the Alias was generated by this system. The purpose of the aliases is to be random, so won't accept a user-defined alias (the philosophy being that people will choose aliases that identify them, even subconsciously)

        //insert the public key into the account entry to complete the profile
        //Add to the login history
        //res.status(200).send( "A new account has successfully been created");
    });

    router.get('/requestToken/:alias?', async (req, res, next) => {
        var Sessions = mongoose.model('sessions', sessionSchema);//
        var Accounts = mongoose.model('accounts', accountSchema);//

        //get the Alias from the URI
        var alias = req.params.alias;
        //make a new request token;
        var requestToken = uuidv4();

        //verify if the alias provided exists
        var availableAlias = await Accounts.find({alias:alias, publicKey: { $ne: null } , momentDeleted:null}).exec();
        console.log(availableAlias)
        if(!availableAlias.length)
        {
            res.status(401).send({code:-1, message:"Unauthorized request."});
        }
        else
        {
            //create a session in the DB
            //Insert the created account. We know it has a public key from the previous query
            var newSession = [{alias:alias, publicKey: availableAlias[0].publicKey, requestToken:requestToken, momentCreated: new Date().getTime() }];
            Sessions.insertMany( newSession ,(error, docs) => {
                if(error)
                {
                console.log(error);
                res.status(500).send({code:-1, message:"Server Error. Type not specified."});
                }
                res.status(200).send({code:1, alias:alias, requestToken:requestToken});
            });
        }
    });
     
    router.post('/requestVerification', async (req, res, next) => {
        var Sessions = mongoose.model('sessions', sessionSchema);//

        //get the Alias from the URI
        var requestToken = req.body.requestToken;
        var signature64 = req.body.signature64;

        var verifySession = await Sessions.find({requestToken:requestToken, publicKey: { $ne: null } , momentDeleted:null}).exec();
        console.log(verifySession)
        if(verifySession.length)
        {
            //do some Forge Crypto verification
            var publicKey = forge.pki.publicKeyFromPem(verifySession[0].publicKey);

            //use the signature base64 version https://github.com/digitalbazaar/forge/issues/301
             var sig = forge.util.decode64(signature64);
    
            var md = forge.md.sha1.create();
            md.update(requestToken, 'utf8');

            var pss = forge.pss.create({
                md: forge.md.sha1.create(),
                mgf: forge.mgf.mgf1.create(forge.md.sha1.create()),
                saltLength: 20
                // optionally pass 'prng' with a custom PRNG implementation
            });
    
            var verifySig = publicKey.verify(md.digest().getBytes(), sig, pss);

            if(verifySig) //the signature has been verified
            {
                var momentVerified = new Date();
                var token = jwt.sign({
                    
                     iss: 'paxxage.com' , //the website of origin
                     jti: requestToken , //the original request token id
                     alias: verifySession[0].alias,
                     exp: new Date().getTime() + (3*60*1000), //3 hours.  Need a mechanism for renewing the JWT to update the expiry. This might go to the database though 
                     iat: momentVerified.getTime(), //issue time
                     nbf: momentVerified.getTime() - (5*1000), //dont allow anyone to call it 5 minutes in the past
                     features:["poems"],

                    }, paxxagePrivatePem, { algorithm: 'RS256'});
                var decoded = jwt.decode(token, {complete: true});
    
                Sessions.updateOne({"_id":verifySession[0]._id}, {$set:{jwt:token, jwtDecoded:decoded, momentVerified:momentVerified}} ,(error, docs) => 
                {
                    if(error) res.status(500).send({code:-1, message:"Server Error. Type not specified."});
                    else 
                    {
                        res.status(200).send({code:1, message:"Session successfully created", jwt:token, jwtDecoded:decoded});
                    }
                });
            }
            else
            {
                res.status(401).send({code:-1, message:"Unauthorized request. Verification failed."});
            }
            //if the signature checks out generate the JWT

            //verify JWT will move to middleware for subsequent validations. This is just for DEV testing
            // var verify = jwt.verify(token, paxxagePublicPem, function(err, decoded) {
            //     console.log("Decoded", decoded) // bar
            //   });
            //console.log("Verify", verify);

        }

    });
     

// //generate a challenge string
// //save the challenge string into a session request. The request will only be valid for a small amount of time <60 seconds
// //Once the session is created, it cannot be initialized any longer
// //return the challenge string
// router.get('/challenge', function (req, res, next) {

//     //create the session request variables
//     var sessionString=uuidv4();
//     var requestStart = new Date().getTime();
//     var requestExpiry = requestStart + (60*1000); //expires in 60 seconds
    
//     //build the value to insert into the DB
//     var session = {
//         sessionString:sessionString,
//         requestStart: requestStart,
//         requestExpiry: requestExpiry,
//     }

//     //do the insert
//     //var Sessions = mongoose.model('sessions', sessionSchema);


//     res.status(200).send(session);
// });

//verify the signed string
//see if that person is currently signed in (session open), and if so end it
//provide a JWT back for the person if the signature is valid
router.post('/verify', function (req, res, next) {

    //alias, time, and signature of the alias and time are required

    res.status(200).send( "Sample call successful");
});

//Performs a sample task using the JWT middleware to verify the session is valid
//In this demo this is called once before the signOut to validate it is working and once after the signOut to return a non-working response
router.post('/sampleRequest', function (req, res, next) {
    res.status(200).send( "Sample call successful");
});

//Sign out destroys the JWT token and invalidates the session
router.post('/signOut', function (req, res, next) {
    res.status(200).send( "Session destroyed");
});

//Functions used within this router
function uuidv4(){return(""+1e7+-1e3+-4e3+-8e3+-1e11).replace(/1|0/g,function(){return(0|Math.random()*16).toString(16)})}

function getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }
  

//export the router back to the index.js page
module.exports = router;
