// define new routes here
util = require('util');

var jQuery = require('jQuery');

exports.index = function(req, res){
  res.render('index', { locals: {
    title: 'Threatwiki'
    , scripts: []
  }});
};

exports.soc = function(req, res){
  //only render the page if we are logged in the system
  var splitemail = req.session.auth.google.user.email.split("@");
  var domain = splitemail[1];
  if (req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    jQuery.getJSON('http://localhost:3000/api/soc?callback=?', function(socs) {
      console.log(socs);
      res.render('socList', { locals: {
        title: 'SOC Manager'
        , scripts: ['/javascript/soc_list.js']
        , socs: socs
      }});
    });
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.soc.create = function(req, res){
  //only render the page if we are logged in the system
  var splitemail = req.session.auth.google.user.email.split("@");
  var domain = splitemail[1];
  if (req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    res.render('soc', { locals: {
      title: 'Create an SOC'
      , scripts: ['/javascript/soc.js']
    }});
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.soc.edit = function(req, res){
  //only render the page if we are logged in the system
  var splitemail = req.session.auth.google.user.email.split("@");
  var domain = splitemail[1];
  if (req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    var obj_id = req.query["id"];
    console.log('http://localhost:3000/api/soc/'+ obj_id +'?callback=?');

    jQuery.getJSON('http://localhost:3000/api/soc/'+ obj_id +'?callback=?', function(soc) {
      res.render('soc', { locals: {
        title: 'Edit SOC'
        , scripts: ['/javascript/soc.js']
        , soc: soc
      }});
    });
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.datapoint = function(req, res){
  var splitemail = req.session.auth.google.user.email.split("@");
var domain = splitemail[1];
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    jQuery.getJSON('http://localhost:3000/api/datapoint?callback=?', function(datapoints) {
      console.log(datapoints);
      res.render('datapointList', { locals: {
        title: 'Datapoint Manager'
        , scripts: ['/javascript/datapoint_list.js']
        , datapoints: datapoints
      }});
    })
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.datapoint.create = function(req, res){
  var splitemail = req.session.auth.google.user.email.split("@");
var domain = splitemail[1];
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    res.render('datapoint', { locals: {
      title: 'Create Datapoint'
      ,  scripts: ['/javascript/datapoint.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', '/javascript/jquery.auto-geocoder.js']
    }});
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.datapoint.edit = function(req, res){
  //only render the page if we are logged in the system
  var splitemail = req.session.auth.google.user.email.split("@");
  var domain = splitemail[1];
  if (req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    var obj_id = req.query["id"];
    console.log('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?');

    jQuery.getJSON('http://localhost:3000/api/datapoint/'+ obj_id +'?callback=?', function(datapoint) {
      res.render('datapoint', { locals: {
        title: 'Edit Datapoint'
        , scripts: ['/javascript/datapoint.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', '/javascript/jquery.auto-geocoder.js']
        , datapoint: datapoint
      }});
    });
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.tag = function(req, res){
  var splitemail = req.session.auth.google.user.email.split("@");
var domain = splitemail[1];
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    jQuery.getJSON('http://localhost:3000/api/tag?callback=?', function(tags) {
      console.log(tags);
      res.render('tagList', { locals: {
        title: 'Tag Manager'
        , scripts: ['/javascript/tag_list.js']
        , tags: tags
      }});
    })
  } else {
    //force logout if user doesn't meet conditions to view the page
    res.redirect('/logout');
  }
};

exports.tag.create = function(req, res){
  var splitemail = req.session.auth.google.user.email.split("@");
var domain = splitemail[1];
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    res.render('tag', { locals: {
      title: 'Create Tag'
      , scripts: ['/javascript/tag.js']
    }});
  } else {
    //force logout if user doesn't meet conditions to view the page
    res.redirect('/logout');
  }
};

exports.tag.edit = function(req, res){
  //only render the page if we are logged in the system
  var splitemail = req.session.auth.google.user.email.split("@");
  var domain = splitemail[1];
  if (req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    var obj_id = req.query["id"];
    console.log('http://localhost:3000/api/tag/'+ obj_id +'?callback=?');

    jQuery.getJSON('http://localhost:3000/api/tag/'+ obj_id +'?callback=?', function(tag) {
      res.render('tag', { locals: {
        title: 'Edit Tag'
        , scripts: ['/javascript/tag.js']
        , tag: tag
      }});
    });
  } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};
