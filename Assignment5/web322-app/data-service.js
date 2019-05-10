const Sequelize = require('sequelize');

var sequelize = new Sequelize('da8b449i3a6bgr', 'mftpkdsnozdsnt', '1f9bc4d9f2ee4608b42b2a7168a66579f29651dc655d971ce114474a3871eec3', {
  host: 'ec2-174-129-212-12.compute-1.amazonaws.com',
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: true
  }
});


// Define a "Employee" model
var Employee = sequelize.define('Employee', {
  employeeNum: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true  // automatically increment the value
  },
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
  email: Sequelize.STRING,
  SSN: Sequelize.STRING,
  addressStreet: Sequelize.STRING,
  addressCity: Sequelize.STRING,
  addressState: Sequelize.STRING,
  addressPostal: Sequelize.STRING,
  maritalStatus: Sequelize.STRING,
  isManager: Sequelize.BOOLEAN,
  employeeManagerNum: Sequelize.INTEGER,
  status: Sequelize.STRING,
  hireDate: Sequelize.STRING
});

// Define a "Department" model
var Department = sequelize.define('Department', {
  departmentId: {
    type: Sequelize.INTEGER,
    primaryKey: true, // use "project_id" as a primary key
    autoIncrement: true // automatically increment the value
  },
  departmentName: Sequelize.STRING
});


Department.hasMany(Employee, { foreignKey: 'department' });

//fs module provides an API for interacting with the file system
const fs = require("fs");

//function read JSON file and store data loacal variable if any error occurs then throw error.
module.exports.initialize = function () {

  return new Promise(function (resolve, reject) {
    sequelize.authenticate().then(function () {
      resolve("successfully");
    }).catch(function (err) {
      console.log("databse Error : " + err);
      reject("unable to sync the database" + err);
    })

  });
};


//return all employees array and if no employees there then return error message
module.exports.getAllEmployees = function () {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      order: ["employeeNum"]
    }).then(function (data) {
      resolve(data);
    }).catch(function () {
      reject("no results returned");
    })
  });
}


//return all manager array and if no manager there then return error message
module.exports.getManagers = function () {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: { isManager: true }
    }).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject("no results returned");
    });
  });
}


//return all Department array and if no department there then return error message
module.exports.getDepartments = function () {
  return new Promise(function (resolve, reject) {
    Department.findAll({
      order: ["departmentId"]
    }).then(function (data) {
      resolve(data);
    }).catch(function () {
      reject("no results returned");
    })
  });
};

//function get emp data in perameter and add data to emp list
module.exports.addEmployee = function (employeeData) {

  return new Promise(function (resolve, reject) {
    employeeData.isManager = (employeeData.isManager) ? true : false;

    for (var prop in employeeData) {
      if (employeeData[prop] == "") {
        employeeData[prop] = null;
      }
    }

    Employee.create(employeeData)
      .then(function () {
        resolve();
      })
      .catch(function (err) {
        reject("unable to create employee");
      });
  });
}

// function get status of employee and return employees list.
module.exports.getEmployeesByStatus = function (statusId) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: { status: statusId }
    }).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject("no results returned");
    });
  });
};


//function get department Id and return emp list base on department.
module.exports.getEmployeesByDepartment = function (departmentId) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: { department: departmentId }
    }).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject("no results returned");
    });
  });
};

//function get manager Id and return list of emp, who are under of that manger.
module.exports.getEmployeesByManager = function (managerId) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: { employeeManagerNum: managerId }
    }).then(function (data) {
      resolve(data);
    }).catch(function (err) {
      reject("no results returned");
    });
  });
}


// function get employee number and return that employee data
module.exports.getEmployeeByNum = function (empNo) {
  return new Promise(function (resolve, reject) {
    Employee.findAll({
      where: { employeeNum: empNo }
    }).then(function (data) {
      resolve(data[0]);
    }).catch(function (err) {
      reject("no results returned");
    });
  });
};


module.exports.updateEmployee = function (employeeData) {

  return new Promise(function (resolve, reject) {
    employeeData.isManager = (employeeData.isManager) ? true : false;

    for (const prop in employeeData) {
      if (employeeData[prop] == "") {
        employeeData[prop] = null;
      }
    }

    Employee.update(employeeData, {
      where: { employeeNum: employeeData.employeeNum }
    }).then(function () {
      resolve();
    }).catch(function () {
      reject("unable to create employee");
    });
  });
};


module.exports.addDepartment = function (departmentData) {

  return new Promise(function (resolve, reject) {

    for (var prop in departmentData) {
      if (departmentData[prop] == "") {
        departmentData[prop] = null;
      }
    }
    Department.create(departmentData)
      .then(function () {
        resolve();
      })
      .catch(function () {
        reject("unable to create department");
      });
  });
}

module.exports.updateDepartment = function (departmentData) {

  return new Promise(function (resolve, reject) {

    for (var prop in departmentData) {
      if (departmentData[prop] == "") {
        departmentData[prop] = null;
      }
    }

    Department.update(departmentData, {
      where: { departmentId: departmentData.departmentId }
    }).then(function (data) {
      resolve();
    }).catch(function () {
      reject("unable to create department");
    });
  });
};

module.exports.getDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    Department.findAll({
      where: { departmentId: id }
    }).then(function (data) {
      resolve(data[0]);
    }).catch(function () {
      reject("no results returned");
    });
  });
};

module.exports.deleteDepartmentById = function (id) {
  return new Promise(function (resolve, reject) {
    Department.destroy({
      where: { departmentId: id }
    }).then(function (data) {
      resolve("destroyed");
    }).catch(function () {
      reject("no results returned");
    })
  });
}

module.exports.deleteEmployeeByNum = function (empNum) {
  return new Promise(function (resolve, reject) {
    Employee.destroy({
      where: { employeeNum: empNum }
    }).then(function () {
      resolve();
    }).catch(function () {
      reject("unable to delete employee");
    });
  });
}