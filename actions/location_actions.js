var express = require("express");

function load_locationActions(app, locationmodel) {
  var LocationModel = locationmodel;
  // retrieve all
  app.get('/api/location', function (req, res) {
    return LocationModel.find(function (err, locations) {
      if (!err) {
        return res.send(locations);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/location/:id', function (req, res) {
    return LocationModel.findById(req.params.id, function (err, location1) {
      if (!err) {
        return res.send(location1);
      } else {
        return console.log(err);
      }
    });
  });

  // create
  app.post('/api/location', function (req, res) {
    var location1;
    console.log("POST: ");
    console.log(req.body);

    location1 = new LocationModel({
      title: req.body.title,
      latitude: req.body.latitude,
      longitude: req.body.longitude
    });

    location1.save(function (err) {
      if (!err) {
        return console.log("created");
      } else {
        return console.log(err);
      }
    });
    return res.send(location1);
  });

  // update
  app.put('/api/location/:id', function (req, res) {
    return LocationModel.findById(req.params.id, function (err, location1) {
      location1.title = req.body.title;
      location1.latitude = req.body.latitude;
      location1.longitude = req.body.longitude;
      return location1.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(location1);
      });
    });
  });

  // delete by id
  app.get('/api/location/delete/:id', function (req, res) {
    return LocationModel.findById(req.params.id, function (err, location1) {
      return location1.remove(function (err) {
        if (!err) {
          console.log("removed");
          return res.send('');
        } else {
          console.log(err);
        }
      });
    });
  });
}

exports.load_locationActions = load_locationActions;
