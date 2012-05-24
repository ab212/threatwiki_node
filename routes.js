// define new routes here
util = require('util');

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
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    res.render('soc', { locals: {
      title: 'SOC Manager'
      , scripts: ['javascript/soc.js']
    }});
  }else{
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
  }
};

exports.datapoint = function(req, res){
  var splitemail = req.session.auth.google.user.email.split("@");
var domain = splitemail[1];
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn && domain=='thesentinelproject.org'){
    res.render('datapoint', { locals: {
      title: 'Datapoint Manager'
      ,  scripts: ['javascript/datapoint.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', 'javascript/jquery.auto-geocoder.js']
    }});
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
    res.render('tag', { locals: {
      title: 'Tag Manager'
      , scripts: ['javascript/tag.js']
    }});
  } else {
    //force logout if user doesn't meet conditions to view the page
    res.redirect('/logout');
  }
};
