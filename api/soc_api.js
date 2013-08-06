var express = require("express");
var time = require('time')(Date);

function generateDevUser(UserModel, callback) {
  user = new UserModel({
    name: "developer"+Date.now(),
    email: "dev@outerspace.com"+Date.now(),
    created : Date.now(),
    modified: Date.now()
  });
  user.save(function (err) {
    if (!err) {
      console.log("Dev User created");
      callback(user);
      return user;
    } else {
      console.log("Could not Save: " + err);
      return res.send(500);
    }
  });
}

// authenticate user based on the incoming request
function authenticate(req, res, UserModel, callback) {
  if (req.session.auth && req.session.auth.loggedIn) {
    UserModel.findOne({'email':req.session.auth.google.user.email}).exec(function (err, user) {
      if(!err && user){
        callback(user);
        return user;
      } else {
        console.log(err);
        return res.send(null);
      }
    });
    return true;
  } else {
    console.log("This action is not permitted if you are not logged in");
    return res.send(401);
  }
}

function load_socApi(app, SocModel, UserModel,DataPointModel,TagModel) {
  // retrieve all
  app.get('/api/soc', function (req, res){
    //return everything excepts the ones that are archive = true
    return SocModel.find({archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, socs) {
      if (!err && socs) {
        return res.jsonp(socs);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by id
  app.get('/api/soc/:id', function (req, res) {
    return SocModel.findById(req.params.id).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date, date format is milliseconds since 1970/01/01
  app.get('/api/soc/date/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date,10));
    var d_big = d_small;
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return SocModel.find({created: {$gte : d_small, $lt : d_big},archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date after, date format is milliseconds since 1970/01/01
  app.get('/api/soc/date/after/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date,10));
    d_small.setHours(0,0,0,0);
    return SocModel.find({created: {$gte : d_small},archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);

      }
    });
  });

  // retrieve by date before, date format is milliseconds since 1970/01/01
  app.get('/api/soc/date/before/:date', function (req, res) {
    var d_big = new Date(parseInt(req.params.date,10));
    d_big.setHours(23,59,59,59);
    return SocModel.find({created: {$lt : d_big},archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date range, date format is milliseconds since 1970/01/01
  app.get('/api/soc/date/range/:date_start/:date_end', function (req, res) {
    console.log("Search between range");
    console.log("Range start: " + req.params.date_start);
    console.log("Range end: " + req.params.date_end);
    var d_start = new Date(parseInt(req.params.date_start,10));
    var d_end = new Date(parseInt(req.params.date_end,10));
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return SocModel.find({created: {$gte : d_start, $lt : d_end},archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);

      }
    });
  });

  // retrieve by title
  app.get('/api/soc/title/:title', function (req, res) {
    return SocModel.findOne({ title: { $regex : new RegExp(req.params.title, "i")}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
      if (!err && soc) {
        return res.jsonp(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by user
  app.get('/api/soc/user/:email', function (req, res) {
    // first retrieve user based on user_name
    var user = UserModel.find({ email: { $regex : new RegExp(req.params.email, "i")}}, function (err, user) {
      if (!err && user) {
        // search soc for the user_id that we just found
        return SocModel.find({createdBy: user[0]._id,archive: {$ne: true}}).populate('createdBy','name').populate('modifiedBy','name').exec(function (err, soc) {
          if (!err && soc) {
            return res.jsonp(soc);
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

  // create
  app.post('/api/soc', function (req, res) {
    var soc;
    console.log("POST: ");
    console.log(req.body);

    var date_now = new Date();
    date_now.setTimezone('UTC');

    function save_soc (req, date_now, user) {
      soc = new SocModel({
        title: req.body.title,
        isocountry: req.body.titlecode,
        displayname: req.body.displayname,
        created: date_now,
        modified: date_now,
        //save the _id of the current user in the new SOC
        createdBy: user._id,
        modifiedBy: user._id,
        nextSerialNumber: 1
      });
      soc.save(function (err) {
        if (!err) {
          console.log("SOC created");
          return res.jsonp(soc);
        } else {
          console.log("Could not save SOC: " + err);
          return res.send(500);
        }
      });
    }
    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        save_soc(req, date_now, user);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        save_soc(req, date_now, user);
      });
    }
  });

  // update
  app.put('/api/soc/:id', function (req, res) {
    var date_now = new Date();
    date_now.setTimezone('UTC');
    function update_soc(req, date_now, user) {
      SocModel.findById(req.params.id, function (err, soc) {
      if (!err && soc){

        oldTitle = soc.title;
        soc.title = req.body.title;
        soc.displayname= req.body.displayname;
        soc.isocountry= req.body.titlecode;
        soc.modified = date_now;
        soc.modifiedBy = user._id;

        return soc.save(function (err) {
          if (!err) {
            console.log("SOC updated");
            //Now that SOC record is updated, we want to update the SOC value stored in Datapoints and Tags
            var searchConditions = { soc: oldTitle},
             update = {   soc: soc.title },
             options = { multi: true };
             //Update datapoints
             DataPointModel.update(searchConditions, update, options, function(err, numAffected) {
                  if (err){
                    console.log(err);
                  }
                 });
             //Update tags
             TagModel.update(searchConditions, update, options, function(err, numAffected) {
                  if (err){
                    console.log(err);
                  }
                 });
            return res.jsonp(soc);
          } else {
            console.log(err);
            return res.send(500);
          }
        });
      } else {
        console.log(err);
        return res.send(null);
      }
    });
    }

    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        update_soc(req, date_now, user);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        update_soc(req, date_now, user);
      });
    }
  });

  //archive SOC by ID
  app.put('/api/soc/:id/archive', function (req, res) {

    function archiveSoc(req){
      return SocModel.findById(req.params.id, function (err,soc) {
        console.log("time to archive"+req.body.archive);
        if (!err && soc){
          soc.archive=req.body.archive;
          return soc.save(function (err) {
            if (!err) {
              return res.send(200);
            } else {
              console.log('Cant archive soc '+err);
              return res.send(500);
            }
          });
        } else {
          console.log('Cant archive the SOC'+req.params.id+err);
          return res.send(500);
        }
      });
    }

    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        archiveSoc(req);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        archiveSoc(req);
      });
    }
  });
}

exports.load_socApi = load_socApi;
