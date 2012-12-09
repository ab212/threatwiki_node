var util = require('util');
var moment = require('moment');
var jquery = require('jquery');

// authenticate user based on the incoming request
function authenticate(req, res){
  if (req.session.auth && req.session.auth.loggedIn) {
    var splitemail = req.session.auth.google.user.email.split("@");
    var domain = splitemail[1];
    if (domain!='thesentinelproject.org'){
      return false;
    }
    return true;
  } else {
    return false;
  }
}

function load_routes(app) {
  exports.index = function(req, res){
    res.render('index', {
      title: 'Threatwiki',
      scripts: []
    });
  };

  exports.soc = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jquery.getJSON('http://localhost:3000/api/soc?callback=?', function(socs) {
        //Render the page with list of SOCs only when we are done getting info about each datapoint
        function render() {
          res.render('socList', {
            title: 'Sentinel Project: SOC Manager',
            socs: socs,
            datapoints: resultsDatapoints
          });
        }
        // convert dates from ISO-8601 to string
        // consider doing this in a better way
        // one way is the write a virtual method for mongo date itself, but that is kinda sloppy
        var resultsDatapoints = [];
        for(i=0; i<socs.length; i++) {
          socs[i].created = moment(socs[i].created).format("YYYY-MM-DD");
          socs[i].modified = moment(socs[i].modified).format("YYYY-MM-DD");
          jquery.getJSON('http://localhost:3000/api/datapoint/soc/'+ socs[i].title +'?callback=?', function(datapoints) {
            //sort DESC date by created date to get the most recent datapoint created
            datapoints.sort(function(a,b){return new Date(b.created)-new Date(a.created);});
            resultsDatapoints.push(datapoints[0]);
            //Call render only when we are done with all the API calls
            if(resultsDatapoints.length == socs.length) {
              render();
            }
          });
        }

      });
    } else {
        //force logout if user doesn't meet conditions to view the page
        res.redirect('/logout');
    }
  };

  exports.soc.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      res.render('socForm', {
        title: 'Sentinel Project: Create a SOC'
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.soc.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/soc/'+ obj_id +'?callback=?');
      jquery.getJSON('http://localhost:3000/api/soc/'+ obj_id +'?callback=?', function(soc) {
        soc.created = moment(soc.created).format("YYYY-MM-DD");
        soc.modified = moment(soc.modified).format("YYYY-MM-DD");
        res.render('socForm',  {
          title: 'Sentinel Project: Edit SOC '+soc.title,
          soc: soc
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };


  exports.soc.view = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var socname = req.query["soc"];
      var tagname = req.query["tag"];

      if (typeof(tagname) != 'undefined') {
        jquery.getJSON('http://localhost:3000/api/datapoint/tag/'+ tagname +'?callback=?', function(datapoints) {
          jquery.getJSON('http://localhost:3000/api/soc/title/'+ socname +'?callback=?', function(soc) {
            jquery.getJSON('http://localhost:3000/api/tag/'+ tagname +'?callback=?', function(tag) {
              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("YYYY-MM-DD");
                datapoints[i].modified = moment(datapoints[i].modified).format("YYYY-MM-DD");
                datapoints[i].event_date = moment(datapoints[i].event_date).format("YYYY-MM-DD");
              }
              res.render('socView', {
                  title: 'Sentinel Project: Edit SOC '+soc.title,
                  datapoints: datapoints,
                  soc:soc,
                  tag:tag
              });
            });
          });
        });
      } else {
        jquery.getJSON('http://localhost:3000/api/datapoint/soc/'+ socname +'?callback=?', function(datapoints) {
          jquery.getJSON('http://localhost:3000/api/soc/title/'+ socname +'?callback=?', function(soc) {
            jquery.getJSON('http://localhost:3000/api/tag/soc/'+ socname +'?callback=?', function(tags) {
              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("YYYY-MM-DD");
                datapoints[i].modified = moment(datapoints[i].modified).format("YYYY-MM-DD");
                datapoints[i].event_date = moment(datapoints[i].event_date).format("YYYY-MM-DD");
              }
              res.render('socView', {
                  title: 'Sentinel Project: Edit SOC '+soc.title,
                  datapoints: datapoints,
                  soc:soc,
                  tags:tags
              });
            });
          });
        });
      }

    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jquery.getJSON('http://localhost:3000/api/datapoint?callback=?', function(datapoints) {
        console.log(datapoints);
        // convert dates from ISO-8601 to string
        for(i=0; i<datapoints.length; i++) {
          datapoints[i].created = moment(datapoints[i].created).format("YYYY-MM-DD");
          datapoints[i].modified = moment(datapoints[i].modified).format("YYYY-MM-DD");
          datapoints[i].event_date = moment(datapoints[i].event_date).format("YYYY-MM-DD");
        }

        res.render('datapointList', {
          title: 'Sentinel Project: Datapoint Manager',
          datapoints: datapoints
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var socname = req.query["soc"];
      var tagid = req.query["tag"];
      if (typeof(tagid)!='undefined'){
        jquery.getJSON('http://localhost:3000/api/tag/'+ tagid +'?callback=?', function(tag) {
          res.render('datapointForm', {
            title: 'Sentinel Project: Create Datapoint for SOC '+socname,
            socname:socname,
            tag:tag
          });
        });
      } else {
        res.render('datapointForm', {
            title: 'Sentinel Project: Create Datapoint for SOC '+socname,
            socname:socname,
            tag:tagid
          });
      }

    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.datapoint.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?');

      jquery.getJSON('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?', function(datapoint) {
        datapoint.created = moment(datapoint.created).format("YYYY-MM-DD");
        datapoint.modified = moment(datapoint.modified).format("YYYY-MM-DD");
        datapoint.event_date = moment(datapoint.event_date).format("YYYY-MM-DD");

        res.render('datapointForm', {
          title: 'Sentinel Project: Edit Datapoint '+datapoint.title,
          datapoint: datapoint
        });
      });
    } else {
        //force logout if user doesn't meet conditions to view the page
        res.redirect('/logout');
    }
  };

  exports.tag = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jquery.getJSON('http://localhost:3000/api/tag?callback=?', function(tags) {
        console.log(tags);

        // convert dates from ISO-8601 to string
        for(i=0; i<tags.length; i++) {
          tags[i].created = moment(tags[i].created).format("YYYY-MM-DD");
          tags[i].modified = moment(tags[i].modified).format("YYYY-MM-DD");
        }

        res.render('tagList', {
          title: 'Sentinel Project: Tag Manager',
          tags: tags
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.tag.create = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var socname = req.query["soc"];
      res.render('tagForm', {
        title: 'Sentinel Project: Create Tag',
        socname: socname
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.tag.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      console.log('http://localhost:3000/api/tag/'+ obj_id +'?callback=?');
      jquery.getJSON('http://localhost:3000/api/tag/'+ obj_id +'?callback=?', function(tag) {
        res.render('tagForm', {
          title: 'Sentinel Project: Edit Tag '+tag.title,
          tag: tag
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };
}

exports.load_routes = load_routes;
