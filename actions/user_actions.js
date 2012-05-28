var express = require("express");

function load_userActions(app, usermodel) {
  var UserModel = usermodel;

  // retrieve all
  app.get('/api/user', function (req, res){
    return UserModel.find(function (err, users) {
      if (!err) {
        return res.send(users);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/user/:id', function (req, res) {
    return UserModel.findById(req.params.id, function (err, user) {
      if (!err) {
        return res.send(user);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by email
  app.get('/api/user/email/:email', function (req, res) {
    return UserModel.find({email: req.params.email}, function (err, user) {
      if (!err) {
        return res.send(user);
      } else {
        return console.log(err);
      }
    });
  });

}

exports.load_userActions = load_userActions;
