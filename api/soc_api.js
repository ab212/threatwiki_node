var express = require("express");
var time = require('time')(Date);

function load_socApi(app, SocModel, UserModel) {

  // retrieve all
  app.get('/api/soc', function (req, res){
    return SocModel.find().populate('createdBy',['name']).run(function (err, socs) {
      if (!err && socs) {
        return res.json(socs);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by id
  app.get('/api/soc/:id', function (req, res) {
    return SocModel.findById(req.params.id).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date
  app.get('/api/soc/date/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date,10));
    var d_big = new Date(parseInt(req.params.date,10));
    d_small.setHours(0,0,0,0);
    d_big.setHours(23,59,59,59);
    return SocModel.find({created: {$gte : d_small, $lt : d_big}}).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date after
  app.get('/api/soc/date/after/:date', function (req, res) {
    var d_small = new Date(parseInt(req.params.date,10));
    d_small.setHours(0,0,0,0);
    return SocModel.find({created: {$gte : d_small}}).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);

      }
    });
  });

  // retrieve by date before
  app.get('/api/soc/date/before/:date', function (req, res) {
    var d_big = new Date(parseInt(req.params.date,10));
    d_big.setHours(23,59,59,59);
    return SocModel.find({created: {$lt : d_big}}).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by date range
  app.get('/api/soc/date/range/:date_start/:date_end', function (req, res) {
    console.log("Search between range");
    console.log("Range start: " + req.params.date_start);
    console.log("Range end: " + req.params.date_end);
    var d_start = new Date(parseInt(req.params.date_start,10));
    var d_end = new Date(parseInt(req.params.date_end,10));
    d_start.setHours(0,0,0,0);
    d_end.setHours(23,59,59,59);
    return SocModel.find({created: {$gte : d_start, $lt : d_end}}).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);

      }
    });
  });

  // retrieve by title
  app.get('/api/soc/title/:title', function (req, res) {
    return SocModel.find({ title: req.params.title}).populate('createdBy',['name']).run(function (err, soc) {
      if (!err && soc) {
        return res.send(soc);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by user
  app.get('/api/soc/user/:user_name', function (req, res) {
    // first retrieve user based on user_name
    var user = UserModel.findOne({ name: req.params.user_name}, function (err, user) {
      if (!err && user) {
        console.log("User found at " + user._id);
        // search soc for the user_id that we just found
        return SocModel.find({createdBy: user._id}).populate('createdBy',['name']).run(function (err, soc) {
          if (!err && soc) {
            return res.send(soc);
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
    if(req.session.auth && req.session.auth.loggedIn){
      //Find the user object in the DB that has the same email as the current loggedin google user
      UserModel.findOne({'email':req.session.auth.google.user.email}).run(function (err, user){
        if(!err && user){
          soc = new SocModel({
            title: req.body.title,
            created: date_now,
            modified: date_now,
            //save the _id of the current user in the new SOC
            createdBy: user._id
          });

          soc.save(function (err) {
            if (!err) {
              return console.log("created");
            } else {
              console.log("!!!Could not Save: " + err);
              return res.send(null);
            }
          });
          return res.send(soc);
        } else {
          console.log(err);
          return res.send(null);
        }
      });
    } else {
      console.log("Can't create a new SOC if currently not logged in");
      return res.send(null);
    }
  });

  // update
  app.put('/api/soc/:id', function (req, res) {
    return SocModel.findById(req.params.id, function (err, soc) {
      var date_now = new Date();
      date_now.setTimezone('UTC');

      soc.title = req.body.title;
      soc.modified = date_now;
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

exports.load_socApi = load_socApi;
