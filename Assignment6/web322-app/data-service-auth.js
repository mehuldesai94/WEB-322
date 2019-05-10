var mongoose = require("mongoose");
const bcrypt = require('bcryptjs');

var Schema = mongoose.Schema;

var userSchema = new Schema({
    "userName": {
        "type": String,
        "unique": true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; // to be defined on new connection (see initialize)

module.exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection("mongodb://mmdesai:mmdesai9894@ds125618.mlab.com:25618/web322_a6");
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

module.exports.registerUser = function (userData) {
    return new Promise(function (resolve, reject) {
        if (userData.password != userData.password2) {
            reject("Passwords do not match");
        } else {
            bcrypt.genSalt(10, function (err, salt) {
                bcrypt.hash(userData.password, salt, function (err, hash) {
                    if (err) {
                        reject("There was an error encrypting the password")
                    } else {
                        userData.password = hash;
                        let newUser = new User(userData);
                        newUser.save((err) => {
                            if (err) {
                                if (err.code == 11000)
                                    reject("User Name already taken");
                                else
                                    reject(`There was an error creating the user: ${err}`);
                            } else {
                                resolve();
                            }
                        });
                    }
                });
            });
        }
    });
};

module.exports.checkUser = function (userData) {
    return new Promise(function (resolve, reject) {
        console.log(userData);
        console.log(userData.userName);
        User.find({
            userName: userData.userName
        })
            .exec()
            .then((users) => {
                console.log(users);
                if (users.length == 0)
                    reject(`Unable to find user: ${userData.userName}`);
                else{
                    bcrypt.compare(userData.password, users[0].password).then((res) => {
                        if (res === true) {
                            let loginData = { dateTime: new Date().toString(), userAgent: userData.userAgent };
                            console.log(loginData);
                            users[0].loginHistory.push(loginData);
    
                            User.update({ userName: users[0].userName },
                                { $set: { loginHistory: users[0].loginHistory } },
                                { multi: false })
                                .exec()
                                .then(() => {
                                    resolve(users[0]);
                                })
                                .catch((err) => {
                                    reject(`There was an error verifying the user: ${err}`);
                                });
                        }
                        else{
                            reject(`Incorrect Password for user: ${userData.userName}`);
                        }
                    }).catch((err)=>{
                        reject(`Unable to find user: ${userData.userName}`);
                    });    
                }
            })
            .catch((err) => {
                console.log(err);
                reject(`Unable to find user: ${userData.user}`);
            });
    });
}; 