var express = require("express");
var time = require('time')(Date);

function generateDevUser(UserModel) {
  //we generate a random dev user during DEV mode (not using Google Apps auth)
  user = new UserModel({
    name: "developehaxor"+Date.now(),
    email: "dev@outerspace.com"+Date.now(),
    created : Date.now(),
    modified: Date.now()
  });
  user.save(function (err) {
    if (!err) {
      return console.log("created");
    } else {
      console.log("!!!Could not Save: " + err);
      return res.send(null);
    }
  });
  return user;
}

// authenticate user based on the incoming request
function authenticate(req, res){
  if (req.session.auth && req.session.auth.loggedIn) {
    UserModel.findOne({'email':req.session.auth.google.user.email}).run(function (err, user) {
      this.user = user;
      if(!err && user){
        return user;
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  return true;
  }
  return false;
}

function load_datapointApi(app, DataPointModel, TagModel, UserModel) {

  // retrieve all
  app.get('/api/datapoint', function (req, res) {
    return DataPointModel.find().populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoints) {
      if (!err && datapoints) {
        return res.send(datapoints);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by id
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by SOC
  app.get('/api/datapoint/soc/:soc', function (req, res) {
    console.log("DATAPOINT_API:SOC:Search by: " + req.params.soc);
    return DataPointModel.find({soc: req.params.soc}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by tag
  app.get('/api/datapoint/tag/:title', function (req, res) {
    // first retrieve tag based on tag_title
    var tag = TagModel.findOne({ title: req.params.title}, function (err, tag) {
      //console.log(req.params.title);
      if (!err && tag) {
        console.log("Tag found at " + tag._id);
        // search datapoint for the tag_id that we just found
        return DataPointModel.find({tags: tag._id}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
          if (!err && datapoint) {
            console.log(datapoint);
            return res.send(datapoint);
          } else {
            console.log(err);
            return res.send(null);
          }
        });
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by location
  app.get('/api/datapoint/location/:Location', function (req, res) {
    console.log("DATAPOINT_API:LOCATION:Search by: " + req.params.Location);
    return DataPointModel.find({'Location.title': req.params.Location}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date_start,10));
    var d_big = new Date(parseInt(req.params.date_start,10));
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_small, $lt : d_big}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date after, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/date/after/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date_start,10));
    d_small.setHours(0,0,0,0);
    return DataPointModel.find({created: {$gte : d_small}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date before, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/date/before/:date', function (req, res) {
    var d_big = new Date(parseInt(req.params.date,10));
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$lt : d_big}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date range, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/date/range/:date_start/:date_end', function (req, res) {
    console.log("Search between range");
    console.log("Range start: " + req.params.date_start);
    console.log("Range end: " + req.params.date_end);
    var d_start = new Date(parseInt(req.params.date_start,10));
    var d_end = new Date(parseInt(req.params.date_end,10));
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_start, $lt : d_end}}).populate('tags',['title']).populate('created by',['name']).run(function (err, datapoint) {
      if (!err && datapoint) {
        return res.send(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by email
  app.get('/api/datapoint/user/:email', function (req, res) {
    // first retrieve user based on email
    var user = UserModel.findOne({ email: req.params.email}, function (err, user) {
      if (!err && user) {
        console.log("User found at " + user._id);
        // search datapoint for the user_id that we just found
        return DataPointModel.find({createdBy: user._id}).populate('tags',['title']).populate('createdBy',['name']).run(function (err, datapoint) {
          if (!err && datapoint) {
            return res.send(datapoint);
          } else {
            console.log(err);
            return res.send(null);
          }
        });
      } else {
        console.log('No user found or error:'+err);
        return res.send(null);
      }
    });
  });

  // create
  app.post('/api/datapoint', function (req, res) {
    var datapoint;
    //console.log("POST: ");
    //console.log(req.body);

    var date_now = new Date();
    date_now.setTimezone('UTC');
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))) {
      if (typeof user == 'undefined') {
        var user = generateDevUser(UserModel);
      }
      datapoint = new DataPointModel({
        title: req.body.title,
        description: req.body.description,
        soc: req.body.soc,
        Location: {
          title: req.body.location,
          latitude: req.body.latitude,
          longitude: req.body.longitude
        },
        tags: req.body.tag_list,
        created: date_now,
        modified: date_now,
        //save the _id of the current user in the new datapoint
        //TODO: My editor is complaining that scope for variable user might be wrong here
        createdBy: user._id
      });

      return datapoint.save(function (err) {
        if (!err) {
          return console.log("created");
        } else {
          console.log(err);
          return res.send(null);
        }
        return res.send(soc);
      });
    } else {
      console.log("Can't create a new datapoint if currently not logged in");
      return res.send(null);
    }
  });

  // update
  app.put('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err && datapoint){
        var date_now = new Date();
        date_now.setTimezone('UTC');

        datapoint.title = req.body.title;
        datapoint.description = req.body.description;
        datapoint.soc = req.body.soc;
        datapoint.Location.title = req.body.location;
        datapoint.Location.latitude = req.body.latitude;
        datapoint.Location.longitude = req.body.longitude;
        datapoint.tags = req.body.tag_list;
        datapoint.modified = date_now;

        return datapoint.save(function (err) {
          if (!err) {
            console.log("updated");
          } else {
            console.log(err);
          }
        });
      } else {
        console.log('Cant find datapoint by ID '+err);
        return res.send(null);
      }
    });
  });

  // delete by id
  app.get('/api/datapoint/delete/:id', function (req, res) {
     return DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err && datapoint){
        return datapoint.remove(function (err) {
          if (!err) {
            console.log("removed");
            return res.send('');
          } else {
            console.log(err);
          }
        });
      } else {
        console.log('Cant delete datapoint with this id '+err);
        return res.send(null);
      }
    });
  });
}

exports.load_datapointApi = load_datapointApi;
