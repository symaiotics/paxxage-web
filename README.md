# Paxxage.com Public Website

This repository is published to provide access to the code of the https://paxxage.com website. 

The goal is this site is to make simple cryptographic functions easy for the average user. All computations occur in the browser. Nothing is transmitted, and no data is stored. There are no cookies implemented. 

This repository is intended to build confidence in the tools and to provide a basis for other developers to provide similar tools and make crypto-based internet communications the global standard. The signin.html page provides a demo interface for testing the cryptographic functions. JSON Web Tokens (JWTs) are introduced to provide a means of creating and validating sessions. 

There is another repository in the works for the Paxxage Desktop app which is under construction. It is based within the Electron.js framework and uses Node.js functions to accelerate and enhance these processes.

This project is part of the Symaiotics platform.

## Setup

#### Requirements
Node.js 
nodemon (recommended)

#### install
> git clone https://github.com/symaiotics/paxxage-web 
> cd paxxage-web
> npm install
> nodemon (or node index.js to start)

#### Environment
To run this example, you will need to have access to a MongoDB and have private and public key .pem files saved locally on your server.
Access to the MongoDB and the keys are from environmental variables.
In Windows, you can press the Start key, type 'Path' and hit enter. Click Environmental Variables, and add the following:
> PAXXAGEDB: mongodb://localhost:27017/paxxage (or whatever connection string you have to the MongoDB)
> PAXXAGEPRIVATE: c:\demo\pem\privateKey.pem (or wherever you've saved them)
> PAXXAGEPUBLIC: c:\demo\pem\publicKey.pem  

## Libraries
#### Forge
This project adapts the Forge encryption library.
Code has been adapted from their official documentation.

#### Vue.js
Vue was used to make the interface reactive and assist in the display of the crypto values.

#### Font Awesome Free Solid Fonts

#### Bulma 
The Bulma library was used for the UI.

#### Bulma Builder
The code for the site was generated from bulma.dev's Builder interface.

#### Additional Code
This code has also adapted and wishes to recognize code from:

Encode and Decode to/from ArrayBuffer/Base64
http://www.webtoolkit.info/javascript-base64.html#.XqytT6hKhPY

Stoive Binary to Data URI
https://stackoverflow.com/questions/4998908/convert-data-uri-to-file-then-append-to-formdata

#### Images
Images are from Undraw.co with the exception of the rocketship logo for Paxxage.com which is Copyright Symaiotics Corporation.


#### 
Any mistakes are as a result of my own misinterpretation.



##### License: MIT.
