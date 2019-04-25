/*********************************************************************************
 * WEB322 – Assignment 02
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Mehulkumar Desai         Student ID: 110288172           Date: October 02, 2018  
*
* Online (Heroku) Link: https://young-wildwood-82044.herokuapp.com/ 
*
********************************************************************************/

var express = require("express");
var path = require("path");
var dataService = require("./data-service.js");


var app = express();
app.use(express.static('public/img'));
app.use(express.static('public/css'));

var HTTP_PORT = process.env.PORT || 8080;

// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}
 
// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/home.html"));
});

// setup another route to listen on /about
app.get("/about", function (req, res) {
    res.sendFile(path.join(__dirname, "/views/about.html"));
});

// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT, onHttpStart);



//function get all employees from JSON and if file read succesfull then display JSON otherwise display Error
app.get("/employees", function (req, res) {
    dataService.getAllEmployees()
        .then((data) => {
            console.log("getAllEmployees JSON.");
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        })
});


//function get all manager from employees array that store in data-service and if file read succesful then display JSON otherwise display Error
app.get("/managers", function (req, res) {
    dataService.getManagers()
        .then((data) => {
            console.log("getManagers JSON.");
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        })
});

//function get all departments from JSON and if file read succesfull then display JSON otherwise display Error
app.get("/departments", function (req, res) {

    dataService.getDepartments()
        .then((data) => {
            console.log("getDepartments JSON.");
            res.json(data);
        })
        .catch((err) => {
            console.log(err);
            res.json(err);
        })
});



console.log("Ready for initialize");
//initialize server
dataService.initialize()
    .then(() => {
        console.log("initialize.then");
        app.listen(HTTP_PORT, onHttpStart);  //start the server 
    })
    .catch(err => {
        console.log(err);
    })


//applicatio middle-ware that shows custom error
app.use(function (req, res) {
    //res.status(404).sendFile(path.join(__dirname, "public/img/PageNotFound.gif"));
    res.status(404).sendFile(path.join(__dirname, "/public/img/pnf.png"));
});