//fs module provides an API for interacting with the file system
const fs = require("fs");

var employees = [];
var departments = [];
var errMessage = "";

//function read JSON file and store data loacal variable if any error occurs then throw error.
module.exports.initialize = function () {
  var promise = new Promise(function (resolve, reject) {
    try {
      fs.readFile('./data/employees.json', function (err, data) {
        if (err) throw err;

        employees = JSON.parse(data);
        console.log("INIT : employees data load to Array");
      });

      fs.readFile('./data/departments.json', function (err, data) {
        if (err) throw err;

        departments = JSON.parse(data);
        console.log("INIT : departments data load to Array");
      });
    }
    catch (exceptoin) {
      console.log("INIT : Exception is throw");
      reject("INIT : Exception is throw");
    }

    console.log("INIT : SUCCESFULL");
    resolve("INIT : SUCCESFULL");
  });

  return promise;
};


//return all employees array and if no employees there then return error message
module.exports.getAllEmployees = function () {
  var promise = new Promise(function (resolve, reject) {
    if (employees.length == 0) {
      errMessage = "No Employess in JSON file";
      reject({ message: errMessage });
    }

    resolve(employees);
  });

  return promise;
}


//return all manager array and if no manager there then return error message
module.exports.getManagers = function () {
  var managers = [];
  var promise = new Promise(function (resolve, reject) {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].isManager)
        managers.push(employees[i]);
    }

    if (managers.length == 0) {
      errMessage = "No Manager in JSON file";
      reject({ message: errMessage });
    }

    resolve(managers);
  });

  return promise;
}


//return all Department array and if no department there then return error message
module.exports.getDepartments = function () {

  var promise = new Promise(function (resolve, reject) {
    if (departments.length == 0) {
      errMessage = "No Departments in JSON file";
      reject({ message: errMessage });
    }

    resolve(departments);
  })
  return promise;
};

//function get emp data in perameter and add data to emp list
module.exports.addEmployee = function (employeeData) {

  var promise = new Promise(function (resolve, reject) {

    if (employeeData) {
      employeeData.employeeNum = employees.length + 1;

      if (employeeData.isManager)
        employeeData.isManager = true;
      else
        employeeData.isManager = false;

      employees.push(employeeData);
      resolve(employees);
    }
    else {
      errMessage = "Something want worng with Add Employee function";
      reject({ message: errMessage });
    }
  })

  return promise;
}

// function get status of employee and return employees list.
module.exports.getEmployeesByStatus = function (statusId) {
  var employeeByStatus = [];
  var promise = new Promise((resolve, reject) => {

    for (var i = 0; i < employees.length; i++) {
      if (employees[i].status == statusId) {
        employeeByStatus.push(employees[i]);
      }
    }

    if (employeeByStatus.length === 0) {
      errMessage = "no results returned";
      reject({ message: errMessage });
    }

    resolve(employeeByStatus);
  })
  return promise;

};


//function get department Id and return emp list base on department.
module.exports.getEmployeesByDepartment = function (departmentId) {
  var empByDepartment = [];

  var promise = new Promise((resolve, reject) => {

    for (var i = 0; i < employees.length; i++) {
      if (employees[i].department == departmentId)
        empByDepartment.push(employees[i]);
    }

    if (empByDepartment.length === 0) {
      errMessage = "no results returned";
      reject({ message: errMessage });
    }

    resolve(empByDepartment);
  })

  return promise;
};

//function get manager Id and return list of emp, who are under of that manger.
module.exports.getEmployeesByManager = function (managerId) {
  var empByManagers = [];

  var promise = new Promise((resolve, reject) => {
    for (var i = 0; i < employees.length; i++) {
      if (employees[i].employeeManagerNum == managerId)
        empByManagers.push(employees[i]);
    }

    if (empByManagers.length === 0) {
      errMessage = "no results returned";
      reject({ message: errMessage });
    }

    resolve(empByManagers);
  })

  return promise;
}


// function get employee number and return that employee data
module.exports.getEmployeeByNum = function(empNo){

  var employeeData = [];
  console.log("Emp No: " + empNo);
  var promise = new Promise((resolve, reject) => {
    for(var i = 0; i< employees.length; i++){
      if(employees[i].employeeNum == empNo){
        employeeData.push(employees[i]);
        break;
      }
    }

    if(employeeData.length === 0)
    {
      errMessage = "no results returned";
      reject({message : errMessage});
    }

    resolve(employeeData);
  })

  return promise;
};
