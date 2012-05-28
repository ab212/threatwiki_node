var express = require("express");

function load_socActions(app, socmodel) {
  var SocModel = socmodel;
  // retrieve all
  app.get('/api/soc', function (req, res){
    return SocModel.find(function (err, socs) {
      if (!err) {
        return res.json(socs);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/soc/:id', function (req, res) {
    return SocModel.findById(req.params.id, function (err, soc) {
      if (!err) {
        return res.send(soc);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by title
  app.get('/api/soc/title/:title', function (req, res) {
    return SocModel.find({ title: req.params.title}, function (err, soc) {
      if (!err) {
        return res.send(soc);
      } else {
        return console.log(err);
      }
    });
  });

  // create
  app.post('/api/soc', function (req, res) {
    var soc;
    console.log("POST: ");
    console.log(req.body);

    soc = new SocModel({
      title: req.body.title,
    });

    soc.save(function (err) {
      if (!err) {
        return console.log("created");
      } else {
        return console.log("!!!Could not Save: " + err);
      }
    });
    return res.send(soc);
  });

  // update
  app.put('/api/soc/:id', function (req, res) {
    return SocModel.findById(req.params.id, function (err, soc) {
      soc.title = req.body.title;
      return soc.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(soc);
      });
    });
  });

  // delete by id
  app.get('/api/soc/delete/:id', function (req, res) {
    return SocModel.findById(req.params.id, function (err, soc) {
      return soc.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('done');
        } else {
          console.log(err);
        }
      });
    });
  });
}

exports.load_socActions = load_socActions;
