var express = require("express");
var util = require("util");

function load_tagActions(app, TagModel,DataPointModel,UserModel) {

  // retrieve all
  app.get('/api/tag', function (req, res){
    return TagModel.find().populate('createdBy',['name']).run(function (err, tags) {
      if (!err) {
        return res.send(tags);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by id
  app.get('/api/tag/:id', function (req, res) {
    return TagModel.findById(req.params.id).populate('createdBy',['name']).run(function (err, tag) {
      if (!err) {
        return res.send(tag);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by soc name
  app.get('/api/tag/soc/:soc', function (req, res) {
	console.log('TAG_ACTIONS:SOC:Search by ' + req.params.soc);
    return TagModel.find({ soc: req.params.soc}).populate('createdBy',['name']).run(function (err, tag) {
      if (!err) {
        return res.send(tag);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve by tag title
  app.get('/api/tag/title/:title', function (req, res) {
	console.log('TAG_ACTIONS:TITLE:Search by ' + req.params.title);
    return TagModel.find({ title: req.params.title}).populate('createdBy',['name']).run( function (err, tag) {
      if (!err) {
        console.log("Tag found: %o", tag);
        return res.send(tag);
      } else {
        return console.log(err);
      }
    });
  });

  // retrieve all tags inside a datapoint
  app.get('/api/tag/datapoint/:datapointid', function (req, res) {
    console.log('TAG_ACTIONS:DatapointId:Search by ' + req.params.datapointid);
    var datapoint = DataPointModel.findById(req.params.datapointid, function (err, datapoint) {
      if (!err) {
         console.log('TAG_ACTIONS:Id:Search by ' + datapoint.tags);
          return TagModel.find({ _id: {$in: datapoint.tags }}).populate('createdBy',['name']).run(function (err, tag) {
            if (!err) {
              console.log("Tag found: %o", tag);
              return res.send(tag);
            } else {
              return console.log(err);
            }
          });
        } else {
            return console.log(err);
        }
       });
  });

  // create
  app.post('/api/tag', function (req, res) {
    var tag;
    console.log("POST: ");
    console.log(req.body);
    //Find the user object in the DB that has the same email as the current loggedin google user
    UserModel.findOne({'email':req.session.auth.google.user.email}).run(function (err, user){
      if(!err){
    
        tag = new TagModel({
          title: req.body.title,
          description: req.body.description,
          soc: req.body.soc,
          created: Date.now(),
          modified: Date.now(),
          createdBy: user._id
        });

        tag.save(function (err) {
          if (!err) {
            return console.log("created");
          } else {
            return console.log(err);
          }
        });
        return res.send(tag);
      } else {
        return console.log(err);
      }
    });
  });

  // update
  app.put('/api/tag/:id', function (req, res) {
    return TagModel.findById(req.params.id, function (err, tag) {
      tag.title = req.body.title;
      tag.description = req.body.description;
      tag.soc = req.body.soc;
      tag.modified = Date.now();

      return tag.save(function (err) {
        if (!err) {
          console.log("updated");
        } else {
          console.log(err);
        }
        return res.send(tag);
      });
    });
  });

  // delete by id
  app.get('/api/tag/delete/:id', function (req, res) {
    return TagModel.findById(req.params.id, function (err, tag) {
      return tag.remove(function (err) {
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

exports.load_tagActions = load_tagActions;
