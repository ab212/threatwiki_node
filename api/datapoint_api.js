var express = require("express");
var time = require('time')(Date);
var jquery = require('jquery');
var mongoose = require('mongoose');
var secretkey = '123';
var request = require('request');


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
    console.log("This action is not permitted if you are not logged in");
    return res.send(401);
  }
}
//function to save a raw html copy of each datasource we add
function saveUrl(url,WebsiteModel,sourceId,callback){
  //if there is sourceId, it means we deal with an existing source, so we don't re-download the source
  if (sourceId===''){
    return(request(url, function (error, response, body) {
        var website;
        if (!error && typeof(response)!='undefined' && response.statusCode == 200){
          website = new WebsiteModel({
            url:  url,
            //strip out javascript script loading from the data
            content: body.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,' ')
          });
        } else {
          console.log("Can't save url:"+url+" error:"+error);
          callback(-1);
          return(-1);
        }

        return website.save(function (err) {
          if (!err) {
            callback(website._id);
            return (website._id);
          } else {
            console.log("Can't save website data for url:"+url+" error:"+err);
            callback(-1);
            return(-1);
          }
        });
    }));
  } else {
    callback(-1);
    return(-1);
  }
}

function load_datapointApi(app, DataPointModel, TagModel, UserModel, SocModel, WebsiteModel) {

  //If user is currently logged in, we also get the field comment (that is disabled by default in the model)
  function loggedInQuery(req){
    if (app.settings.env != 'production' || (req.session.auth && req.session.auth.loggedIn) || (req.query.secretkey==secretkey)) {
      return ("+comment");
    } else {
      return ("");
    }
  }

  // retrieve all
  app.get('/api/datapoint', function (req, res) {

    return DataPointModel.find({archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
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
    return DataPointModel.findById(req.params.id).populate('tags','title').select(loggedInQuery(req)).populate('createdBy','name').exec(function (err, datapoint) {
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
    return DataPointModel.find({soc: req.params.soc,archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
      if (!err && datapoint) {
        return res.jsonp(datapoint);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by stage of genocide, case insensitive
  app.get('/api/datapoint/stage/:stage', function (req, res) {
    return DataPointModel.find({stage: { $regex : new RegExp(req.params.stage, "i")},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
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
    return DataPointModel.find({ archive: {$ne: true}}).where('tags').all(tagsid).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoints) {
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
    return DataPointModel.find({'Location.title': { $regex : new RegExp(req.params.Location, "i")},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
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
    var d_small = new Date(parseInt(req.params.date,10));
    var d_big = d_small;
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_small, $lt : d_big},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').exec(function (err, datapoint) {
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
    var d_small = new Date(parseInt(req.params.date,10));
    d_small.setHours(0,0,0,0);
    return DataPointModel.find({created: {$gte : d_small},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').exec(function (err, datapoint) {
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
    return DataPointModel.find({created: {$lt : d_big},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').exec(function (err, datapoint) {
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
    var d_start = new Date(parseInt(req.params.date_start,10));
    var d_end = new Date(parseInt(req.params.date_end,10));
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return DataPointModel.find({created: {$gte : d_start, $lt : d_end},archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').exec(function (err, datapoint) {
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
    var user = UserModel.find({ email: { $regex : new RegExp(req.params.email, "i")}}, function (err, user) {
      if (!err && user) {
        // search datapoint for the user_id that we just found
        return DataPointModel.find({createdBy: user[0]._id,archive: {$ne: true}}).select(loggedInQuery(req)).populate('tags','title').populate('createdBy','name').populate('modifiedBy','name').exec(function (err, datapoint) {
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

    function save_datapoint_db (datapoint) {
      return datapoint.save(function (err) {
        if (!err) {
          console.log("Datapoint created");
          return res.jsonp(datapoint);
        } else {
          console.log("Error creating datapoint:"+err);
          return res.send(500);
        }
      });
    }
    var datapoint;

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
              var url = req.body.sourceurl[i];
              //add http if its not there since request library doesnt support URLs without it
              if (!/^(f|ht)tps?:\/\//i.test(url)) {
                url = "http://" + url;
              }
              var sourceType = req.body.sourcetype[i];
              //this pattern is explained here:
              //http://stackoverflow.com/questions/2900839/how-to-structure-javascript-callback-so-that-function-scope-is-maintained-proper
              (function(url,sourceType) {
                 saveUrl(url,WebsiteModel,'',function(websiteId){
                    //websiteId == -1 if we failed to save the wget from the website to mongo
                    if (websiteId!='-1'){
                        datapoint.sources.push({url: url,sourcetype: sourceType, savedurl: websiteId});
                     } else {
                        datapoint.sources.push({url: url,sourcetype: sourceType});
                     }
                     //happens only on the last loop, save the datapoint once we are done creating the datapoint sources
                     if (datapoint.sources.length==req.body.sourceurl.length){
                        save_datapoint_db(datapoint);
                     }
                 });
              })(url,sourceType);
            }
            //when there is only 1 source to save
          } else if (req.body.sourceurl!=='' && req.body.sourcetype!==''){
            var url = req.body.sourceurl;
            //add http if its not there since request library doesnt support URLs without it
            if (!/^(f|ht)tps?:\/\//i.test(url)) {
              url = "http://" + url;
            }
            saveUrl(url,WebsiteModel,'',function(websiteId){
              if (websiteId!='-1'){
                datapoint.sources.push({url: url,sourcetype: req.body.sourcetype, savedurl: websiteId});
              } else {
                datapoint.sources.push({url: url,sourcetype: req.body.sourcetype});
              }
              save_datapoint_db(datapoint);
            });
          } else {
            //there is no sources
            save_datapoint_db(datapoint);
          }
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

    function update_datapoint_db (datapoint) {
      return datapoint.save(function (err) {
        if (!err) {
          console.log("Datapoint updated");
          return res.send(200);
        } else {
          console.log("Error updating datapoint:"+err);
          return res.send(500);
        }
      });
    }

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
          var countSources=new Array();
          for (j=0;j<req.body.sourceurl.length;j++){
            var url = req.body.sourceurl[j];
            //add http if its not there since request library doesnt support URLs without it
            if (!/^(f|ht)tps?:\/\//i.test(url)) {
              url = "http://" + url;
            }
            var sourceType = req.body.sourcetype[j];
            var sourceId = req.body.sourceid[j];
            (function(url,sourceType,sourceId) {
              saveUrl(url,WebsiteModel,sourceId,function(websiteId){
                countSources.push('dummy');
                if (url!=='' && sourceType!==''){
                  if (sourceId!==''){
                    //update existing source
                    var id = mongoose.Types.ObjectId(sourceId);
                    var source = datapoint.sources.id(id);
                    source.url= url;
                    source.sourcetype= sourceType;
                  } else {
                      //create new source
                      if (websiteId!='-1'){
                        datapoint.sources.addToSet({url: url,sourcetype: sourceType, savedurl: websiteId});
                      } else {
                        datapoint.sources.addToSet({url: url,sourcetype: sourceType});
                      }
                  }
                } else if (url==='' && sourceId!==''){
                  //delete source
                  var id_to_delete = mongoose.Types.ObjectId(sourceId);
                  var source_to_delete = datapoint.sources.id(id_to_delete);
                  source_to_delete.remove();
                }
                if (countSources.length==req.body.sourceurl.length){
                  update_datapoint_db(datapoint);
                }
              });
            })(url,sourceType,sourceId);
          }
        } else if (req.body.sourceurl!=='' && req.body.sourcetype!==''){
          var url = req.body.sourceurl;
          //add http if its not there since request library doesnt support URLs without it
          if (!/^(f|ht)tps?:\/\//i.test(url)) {
            url = "http://" + url;
          }
          saveUrl(url,WebsiteModel,req.body.sourceid,function(websiteId){          
            if (req.body.sourceid!==''){
              //update source
              var id_to_update = mongoose.Types.ObjectId(req.body.sourceid);
              var source_to_update = datapoint.sources.id(id_to_update);
              source_to_update.url=url;
              source_to_update.sourcetype=req.body.sourcetype;
            } else {
                if (websiteId!='-1'){
                  datapoint.sources.addToSet({url: url,sourcetype: req.body.sourcetype,savedurl: websiteId});
                } else {
                  //create new source
                  datapoint.sources.addToSet({url: url,sourcetype: req.body.sourcetype});
                }
            }
            update_datapoint_db(datapoint);
          });
        } else if (req.body.sourceurl==='' && req.body.sourceid!=='') {
          //delete source
          var id_delete = mongoose.Types.ObjectId(req.body.sourceid);
          var source_delete = datapoint.sources.id(id_delete);
          source_delete.remove();
          update_datapoint_db(datapoint);
        } else {
          //no sources
          update_datapoint_db(datapoint);

        }

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

 //archive datapoint by ID
  app.put('/api/datapoint/:id/archive', function (req, res) {

    function archiveDatapoint(req) {
      return DataPointModel.update({ _id: req.params.id }, { archive: req.body.archive }, function (err) {
        if (!err){
          return res.send(200);
        } else {
          console.log('Cant archive the datapoint'+req.params.id);
          return res.send(500);
        }
      });
    }

    if((app.settings.env != 'production')) {
      generateDevUser(UserModel, function(user) {
        archiveDatapoint(req);
      });
    } else {
      authenticate(req, res, UserModel, function(user) {
        archiveDatapoint(req);
      });
    }
  });

}

exports.load_datapointApi = load_datapointApi;
