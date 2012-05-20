var express = require("express");

function load_datapointActions(app, datapointmodel) {
  var DataPointModel = datapointmodel;
  // retrieve all
  app.get('/api/datapoint', function (req, res) {
    return DataPointModel.find(function (err, datapoints) {
      if (!err) {
        return res.send(datapoints);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by date
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // create
  app.post('/api/datapoint', function (req, res) {
    var datapoint;
    console.log("POST: ");
    console.log(req.body);

    datapoint = new DataPointModel({
      title: req.body.title,
      description: req.body.description,
      soc: req.body.soc,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      tags: req.body.tag_list
    });

    datapoint.save(function (err) {
      if (!err) {
        return console.log("created");
      } else {
        return console.log(err);
      }
    });
    return res.send(datapoint);
  });

  // update
  app.put('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {

      datapoint = new DataPointModel({
        title: req.body.title,
        description: req.body.description,
        soc: req.body.soc,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
        tags: req.body.tag_list
      });

      return datapoint.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(datapoint);
      });
    });
  });

  // delete by id
  app.get('/api/datapoint/delete/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      return datapoint.remove(function (err) {
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

exports.load_datapointActions = load_datapointActions;
