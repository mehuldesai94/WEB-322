/*********************************************************************************
 * WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Mehulkumar Desai         Student ID: 110288172           Date: November 13, 2018  
*
* Online (Heroku) Link: https://mighty-brushlands-75683.herokuapp.com/
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
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
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


    dataService.getDepartments()
        .then((data) => {
            res.render("addEmployee", { departments: data });
        })
        .catch((err) => {
            res.render("addEmployee", { departments: [] });
        })

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
                if (data.length > 0)
                    res.render('employees', { employees: data });
                else
                    res.render('employees', { message: "no results" });
            })
            .catch((err) => {
                res.render("employees", { message: "no results" });
            })
    }
});


//function get valur from URL and display perticular employee.
app.get("/employee/:value", (req, res) => {

    // initialize an empty object to store the values
    let viewData = {};
    dataService.getEmployeeByNum(req.params.value).then((data) => {
        if (data) {
            viewData.employee = data; //store employee data in the "viewData" object as "employee"
        } else {
            viewData.employee = null; // set employee to null if none were returned
        }
    }).catch(() => {
        viewData.employee = null; // set employee to null if there was an error
    }).then(dataService.getDepartments)
        .then((data) => {
            viewData.departments = data; // store department data in the "viewData" object as "departments"
            // loop through viewData.departments and once we have found the departmentId that matches
            // the employee's "department" value, add a "selected" property to the matching
            // viewData.departments object
            for (let i = 0; i < viewData.departments.length; i++) {
                if (viewData.departments[i].departmentId == viewData.employee.department) {
                    viewData.departments[i].selected = true;
                }
            }
        }).catch(() => {
            viewData.departments = []; // set departments to empty if there was an error
        }).then(() => {
            if (viewData.employee == null) { // if no employee - return an error
                res.status(404).send("Employee Not Found");
            } else {
                res.render("employee", { viewData: viewData }); // render the "employee" view
            }
        });
});

app.post("/employee/update", (req, res) => {
    dataService.updateEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        })
        .catch((err) => {
            res.json(err);
        })
});

//function get all manager from employees array that store in data-service and if file read succesful then display JSON otherwise display Error
app.get("/managers", function (req, res) {
    dataService.getManagers()
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            res.json(err);
        })
});

//function get all departments from JSON and if file read succesfull then display JSON otherwise display Error
app.get("/departments", function (req, res) {

    dataService.getDepartments()
        .then((data) => {
            if (data.length > 0)
                res.render("departments", { departments: data });
            else
                res.render("departments", { message: "no results" });
        })
        .catch((err) => {
            res.render("departments", { message: "no results" });
        })
});


//this method use to add employee to employee list
app.post("/employees/add", function (req, res) {
    dataService.addEmployee(req.body)
        .then((data) => {
            res.redirect("/employees");
        })
        .catch((err) => {
            res.json(err);
        })
});

console.log("Ready for initialize");
//initialize server
dataService.initialize().then(() => {
    app.listen(HTTP_PORT, onHttpStart);  //start the server 
}).catch(err => {
    console.log(err);
});


//
app.get("/departments/add", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/addEmployee.html"));
    res.render("addDepartment");
});


//add new department into databse
app.post("/departments/add", function (req, res) {
    dataService.addDepartment(req.body)
        .then((data) => {
            res.redirect("/departments");
        })
        .catch((err) => {
            res.json(err);
        })
});


//update department from Database and redirect to department page
app.post("/department/update", (req, res) => {
    dataService.updateDepartment(req.body)
        .then(() => {
            res.redirect("/departments");
        })
        .catch((err) => {
            res.json(err);
        })
});


//find department from the databse
app.get("/department/:departmentId", (req, res) => {
    dataService.getDepartmentById(req.params.departmentId)
        .then((data) => {
            if (data)
                res.render("department", { department: data });
            else
                res.status(404).send("Department Not Found");
        })
        .catch((err) => {
            res.status(404).send("Department Not Found");
        })
});


//remove department from Deparment Database table
app.get("/departments/delete/:departmentId", (req, res) => {
    dataService.deleteDepartmentById(req.params.departmentId)
        .then((data) => {
            res.redirect("/departments");
        })
        .catch((err) => {
            res.status(500).send("Unable to Remove Department / Department not found");
        })
});


//remove employee from database
app.get("/employees/delete/:empNum", (req, res) => {
    dataService.deleteEmployeeByNum(req.params.empNum)
        .then((data) => {
            res.redirect("/employees");
        })
        .catch((err) => {
            res.status(500).send("Unable to Remove Employee / Employee not found");
        })
});


//applicatio middle-ware that shows custom error
app.use(function (req, res) {
    res.status(404).sendFile(path.join(__dirname, "/public/images/pnf.png"));
});