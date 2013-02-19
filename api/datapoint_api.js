var express = require("express");
var time = require('time')(Date);
var jquery = require('jquery');
var mongoose = require('mongoose');

function generateDevUser(UserModel, callback) {
  //we generate a random dev user during DEV mode (not using Google Apps auth)
  user = new UserModel({
    name: "developehaxor"+Date.now(),
    email: "dev@outerspace.com"+Date.now(),
    created : Date.now(),
    modified: Date.now()
  });
  user.save(function (err) {
    if (!err) {
      console.log("Generated Dev User created");
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
    console.log("Can't create a new datapoint if currently not logged in");
    return res.send(401);
  }
}

function load_datapointApi(app, DataPointModel, TagModel, UserModel, SocModel) {
  // retrieve all
  app.get('/api/datapoint', function (req, res) {
    return DataPointModel.find({archive: {$ne: true}}).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
      if (!err && datapoints) {
        return res.jsonp(datapoints);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by id
  app.get('/api/datapoint/:id', function (req, res) {
    return DataPointModel.findById(req.params.id).populate('tags','title').populate('created by','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by SOC
  app.get('/api/datapoint/soc/:soc', function (req, res) {
    console.log("DATAPOINT_API:SOC:Search by: " + req.params.soc);
    return DataPointModel.find({soc: req.params.soc,archive: {$ne: true}}).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by stage of genocide
  app.get('/api/datapoint/stage/:stage', function (req, res) {
    console.log("DATAPOINT_API:SOC:Search by: " + req.params.soc);
    return DataPointModel.find({stage: req.params.stage,archive: {$ne: true}}).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
      if (!err && datapoints) {
        return res.jsonp(datapoints);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

   // retrieve by tagids, if multiple tags specified under /api/datapoint/tag/tagidnumberone,tagidnumbertwo then datapoint must contain ALL tags specified (not OR)
  app.get('/api/datapoint/tag/:tagsid', function (req, res) {
    var tagsid=req.params.tagsid.split(',');
    return DataPointModel.find({ archive: {$ne: true}}).where('tags').all(tagsid).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
      if (!err && datapoints) {
        return res.jsonp(datapoints);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by location
  app.get('/api/datapoint/location/:Location', function (req, res) {
    console.log("DATAPOINT_API:LOCATION:Search by: " + req.params.Location);
    return DataPointModel.find({'Location.title': req.params.Location,archive: {$ne: true}}).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/date/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date_start,10));
    var d_big = d_small;
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_small, $lt : d_big},archive: {$ne: true}}).populate('tags','title').populate('created by','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
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
    return DataPointModel.find({created: {$gte : d_small},archive: {$ne: true}}).populate('tags','title').populate('created by','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
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
    return DataPointModel.find({created: {$lt : d_big},archive: {$ne: true}}).populate('tags','title').populate('created by','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date range, date format is milliseconds since 1970/01/01
  app.get('/api/datapoint/date/range/:date_start/:date_end', function (req, res) {
    //console.log("Search between range");
    //console.log("Range start: " + req.params.date_start);
    //console.log("Range end: " + req.params.date_end);
    var d_start = new Date(parseInt(req.params.date_start,10));
    var d_end = new Date(parseInt(req.params.date_end,10));
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_start, $lt : d_end},archive: {$ne: true}}).populate('tags','title').populate('created by','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by email
  app.get('/api/datapoint/user/:email', function (req, res) {
    // first retrieve user based on email
    var user = UserModel.find({ email: req.params.email}, function (err, user) {
      if (!err && user) {
        console.log("User found at " + user._id);
        // search datapoint for the user_id that we just found
        return DataPointModel.find({createdBy: user._id,archive: {$ne: true}}).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
          if (!err && datapoint) {
            return res.jsonp(datapoint);
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

    function save_datapoint (req, date_now, user) {
      //get the SOC most recent serial number available, assign it to the datapoint and increment the value in the SOC
      SocModel.findOneAndUpdate({$inc: { nextSerialNumber: 1 }}).where('title',req.body.soc).setOptions({ new: false }).exec(function (err, soc) {
        if (!err && soc) {
          datapoint = new DataPointModel({
            title: req.body.title,
            description: req.body.description,
            comment: req.body.comment,
            soc: req.body.soc,
            Location: {
              title: req.body.location,
              latitude: req.body.latitude,
              longitude: req.body.longitude
            },
            tags: req.body.tag_list,
            stage: req.body.stage,
            created: date_now,
            modified: date_now,
            event_date: req.body.event_date,
            serialNumber: soc.nextSerialNumber,
            //save the _id of the current user in the new datapoint
            createdBy: user._id,
            modifiedBy: user._id
          });
          //save each source as subdocument individually
          if (jquery.isArray(req.body.sourceurl)){
            for (i=0;i<req.body.sourceurl.length;i++){
              datapoint.sources.push({url: req.body.sourceurl[i],sourcetype: req.body.sourcetype[i]});
            }
          } else if (req.body.sourceurl!=='' && req.body.sourcetype!==''){
            datapoint.sources.push({url: req.body.sourceurl,sourcetype: req.body.sourcetype});
          }

          return datapoint.save(function (err) {
            if (!err) {
              //console.log("Datapoint created");
              return res.jsonp(datapoint);
            } else {
              console.log("Error creating datapoint:"+err);
              return res.send(500);
            }
          });


        } else {
          console.log("Error finding SOC while creating datapoint:"+err);
          return res.send(null);
        }
      });
    }

    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        save_datapoint(req, date_now, user);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        save_datapoint(req, date_now, user);
      });
    }
  });

  // update
  app.put('/api/datapoint/:id', function (req, res) {
    var date_now = new Date();
    date_now.setTimezone('UTC');
    
    function update_datapoint(req, date_now, user) {
      DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err && datapoint){

        datapoint.title = req.body.title;
        datapoint.description = req.body.description;
        datapoint.comment = req.body.comment;
        datapoint.soc = req.body.soc;
        datapoint.Location.title = req.body.location;
        datapoint.Location.latitude = req.body.latitude;
        datapoint.Location.longitude = req.body.longitude;
        datapoint.tags = req.body.tag_list;
        datapoint.stage= req.body.stage;
        datapoint.modified = date_now;
        datapoint.modifiedBy = user._id;
        datapoint.event_date = req.body.event_date;
        //to update/add/remove sources in a datapoint
        if (jquery.isArray(req.body.sourceurl)){
          for (j=0;j<req.body.sourceurl.length;j++){
            if (req.body.sourceurl[j]!=='' && req.body.sourcetype[j]!==''){
              if (req.body.sourceid[j]!==''){
                //update existing source
                var id = mongoose.Types.ObjectId(req.body.sourceid[j]);
                var source = datapoint.sources.id(id);
                source.url= req.body.sourceurl[j];
                source.sourcetype= req.body.sourcetype[j];
              } else {
                //create new source
                datapoint.sources.addToSet({url: req.body.sourceurl[j],sourcetype: req.body.sourcetype[j]});
              }
            } else if (req.body.sourceurl[j]==='' && req.body.sourceid[j]!==''){
              //delete source
              var id_to_delete = mongoose.Types.ObjectId(req.body.sourceid[j]);
              var source_to_delete = datapoint.sources.id(id_to_delete);
              source_to_delete.remove();
            }
          }
        }else if (req.body.sourceurl!=='' && req.body.sourcetype!==''){
          if (req.body.sourceid!==''){
            //update source
            var id_to_update = mongoose.Types.ObjectId(req.body.sourceid);
            var source_to_update = datapoint.sources.id(id_to_update);
            source_to_update.url=req.body.sourceurl;
            source_to_update.sourcetype=req.body.sourcetype;
          } else {
            //create new source
            datapoint.sources.addToSet({url: req.body.sourceurl,sourcetype: req.body.sourcetype});
          }
        } else if (req.body.sourceurl==='' && req.body.sourceid!=='') {
          //delete source
          var id_delete = mongoose.Types.ObjectId(req.body.sourceid);
          var source_delete = datapoint.sources.id(id_delete);
          source_delete.remove();
        }
        
        

        return datapoint.save(function (err) {
          if (!err) {
            console.log("updated");
            return res.send(200);
          } else {
            console.log(err);
            return res.send(500);
          }
        });
      } else {
        console.log('Cant find datapoint by ID '+err);
        return res.send(null);
      }
    });
    }

    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        update_datapoint(req, date_now, user);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        update_datapoint(req, date_now, user);
      });
    }
  });

  // delete by id
  /* Removing the code for now to protect our data, will re-enable when we have an admin access + authenticated API
  app.get('/api/datapoint/delete/:id', function (req, res) {
     return DataPointModel.findById(req.params.id, function (err, datapoint) {
      if (!err && datapoint){
        return datapoint.remove(function (err) {
          if (!err) {
            console.log("removed");
            return res.send(204);
          } else {
            console.log(err);
            return res.send(500);
          }
        });
      } else {
        console.log('Cant delete datapoint with this id '+err);
        return res.send(null);
      }
    });
  });*/

 //archive datapoint by ID
  app.put('/api/datapoint/:id/archive', function (req, res) {
    console.log(req.body.archive);
    return DataPointModel.update({ _id: req.params.id }, { archive: req.body.archive }, function (err) {
    if (!err){
      return res.send(200);
    } else {
      console.log('Cant archive the datapoint'+req.params.id);
      return res.send(500);
    }
  });
});

}

exports.load_datapointApi = load_datapointApi;
