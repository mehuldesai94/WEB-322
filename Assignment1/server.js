/********************************************************************************* 
WEB322 - Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca  Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites) or distributed to other students.
* 
*  Name: Mehulkumar Desai        Student ID: 110288172       Date: September 7, 2018
*
*  Online (Heroku) URL: https://safe-retreat-18397.herokuapp.com/
*
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var app = express();

// setup a 'route' to listen on the default url path
app.get("/", (req, res) => {
    res.send("Mehulkumar Desai - 110288172");
});

// setup http server to listen on HTTP_PORT
app.listen(HTTP_PORT, function(){
    console.log("server listening on: " + HTTP_PORT);
});
