/*********************************************************************************
 * WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Mehulkumar Desai         Student ID: 110288172           Date: October 28, 2018  
*
* Online (Heroku) Link: https://blooming-brook-33910.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const fs = require("fs");
const path = require("path");
const dataService = require("./data-service.js");


var app = express();

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'main',
    helpers: {

        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') + '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },

        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");

            if (lvalue != rvalue)
                return options.inverse(this);
            else
                return options.fn(this);
        }
    }
}));

app.use(express.static('public'));
//app.use(express.static('public/css'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\$/, "");
    next();
});


app.set('view engine', '.hbs');


var HTTP_PORT = process.env.PORT || 8080;




// call this function after the http server starts listening for requests
function onHttpStart() {
    console.log("Express http server listening on: " + HTTP_PORT);
}




// setup a 'route' to listen on the default url path (http://localhost)
app.get("/", function (req, res) {
    //res.sendFile(path.join(__dirname, "/views/home"));
    res.render("home");
});




// setup another route to listen on /about
app.get("/about", function (req, res) {
    // res.sendFile(path.join(__dirname, "/views/about.html"));
    res.render("about");
});




// setup http server to listen on HTTP_PORT
//app.listen(HTTP_PORT, onHttpStart);

app.get("/employees/add", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
    res.render("addEmployee");
});



//Add image route
app.get("/images/add", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/addImage.html"));
    res.render("addImage");
});




//multer method use to store images into specified folder with different name so developer indenfiy it unqiely
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });




// add the middleware function (upload.single("photo")) for multer to process the file upload in the form
app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});



//this function read image array from folder and convert it into JSON 
app.get("/images", (req, res) => {
    var imgPath = "./public/images/uploaded";

    fs.readdir(path.join(__dirname, imgPath), function (err, items) {
        var imageObj = { images: [] };
        for (var i = 0; i < items.length; i++) {
            imageObj.images.push(items[i]);
        }
        //  res.json(imageObj);

        res.render('images', imageObj);
    })
});


//function work base on URL if URL has some query then first display query and if there is no query then display regular emp data
app.get("/employees", function (req, res) {

    if (req.query.status) {
        dataService.getEmployeesByStatus(req.query.status)
            .then((data) => {
                // res.json(data);
                res.render("employees", { employees: data });
            })
            .catch((err) => {
                //res.json(err);
                res.render({ message: "no results" });
            })
    }
    else if (req.query.department) {
        dataService.getEmployeesByDepartment(req.query.department)
            .then((data) => {
                //res.json(data);
                res.render("employees", { employees: data });
            })
            .catch((err) => {
                //res.json(err);
                res.render({ message: "no results" });
            })
    }
    else if (req.query.manager) {
        dataService.getEmployeesByManager(req.query.manager)
            .then((data) => {
                //res.json(data);
                res.render("employees", { employees: data });
            })
            .catch((err) => {
                //res.json(err);
                res.render({ message: "no results" });
            })
    }
    else {
        dataService.getAllEmployees()
            .then((data) => {
                res.render('employees', { employees: data });
            })
            .catch((err) => {
                res.render({ employees: "no results" });
            })
    }
});


//function get valur from URL and display perticular employee.
app.get("/employee/:value", (req, res) => {
    dataService.getEmployeeByNum(req.params.value)
        .then((data) => {
            console.log(data);
            //res.json(data);
            res.render("employee", { employee: data }); 
        })
        .catch((err) => {
            res.render("employee", { message: "no results" });
        })
});

app.post("/employee/update", (req, res) => {
    //console.log(req.body);
    dataService.updateEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch((err) => {
            console.log(err);
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
            res.render("departments", { departments: data });
        })
        .catch((err) => {
            res.render({ message: "no results" });
        })
});


//this method use to add employee to employee list
app.post("/employees/add", function (req, res) {
    dataService.addEmployee(req.body)
        .then((data) => {
            console.log("Employee Added");
            res.redirect("/employees");
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
    res.status(404).sendFile(path.join(__dirname, "/public/images/pnf.png"));
});