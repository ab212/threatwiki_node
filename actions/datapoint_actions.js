var express = require("express");

function load_datapointActions(app, datapointmodel, tagmodel) {
  var DataPointModel = datapointmodel;
  var TagModel = tagmodel;
  // retrieve all
  app.get('/api/datapoint', function (req, res) {
    return DataPointModel.find().populate('tags',['title']).run(function (err, datapoints) {
      if (!err) {
        return res.send(datapoints);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id).populate('tags',['title']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by SOC
  app.get('/api/datapoint/soc/:soc', function (req, res) {
    console.log("DATAPOINT_ACTIONS:SOC:Search by: " + req.params.soc);
    return DataPointModel.find({soc: req.params.soc}).populate('tags',['title']).run(function (err, datapoint) {
      if (!err) {
        return res.send(datapoint);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by tag
  app.get('/api/datapoint/tag/:tag_title', function (req, res) {
    // first retrieve tag based on tag_title
    var tag = TagModel.findOne({ title: req.params.tag_title}, function (err, tag) {
      if (!err) {
        console.log("Tag found at " + tag._id);
        // search datapoint for the tag_id that we just found
        return DataPointModel.find({tags: tag._id}).populate('tags',['title']).run(function (err, datapoint) {
          if (!err) {
            return res.send(datapoint);
          } else {
            return console.log(err);
          }
        });
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by location
  app.get('/api/datapoint/location/:Location', function (req, res) {
    console.log("DATAPOINT_ACTIONS:LOCATION:Search by: " + req.params.Location);
    return DataPointModel.find({'Location.title': req.params.Location}).populate('tags',['title']).run(function (err, datapoint) {
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
      Location: {
		    title: req.body.location,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
	    },
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

      datapoint.title = req.body.title;
      datapoint.description = req.body.description;
      datapoint.soc = req.body.soc;
      datapoint.Location.title = req.body.location;
      datapoint.Location.latitude = req.body.latitude;
      datapoint.Location.longitude = req.body.longitude;
      datapoint.tags = req.body.tags;

      return datapoint.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(datapoint);
      });
    });
    return res.send(datapoint);
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
