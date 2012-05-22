// define new routes here

exports.index = function(req, res){
  res.render('index', { locals: {
    title: 'Threatwiki'
    , scripts: []
  }});
};

exports.soc = function(req, res){
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn){
    res.render('soc', { locals: {
      title: 'SOC Manager'
      , scripts: ['javascript/soc.js']
    }});
  }else{
      console.log("The user is NOT logged in");
      res.redirect('/');
  }
};

exports.datapoint = function(req, res){
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn){
    res.render('datapoint', { locals: {
      title: 'Datapoint Manager'
      ,  scripts: ['javascript/datapoint.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', 'javascript/jquery.auto-geocoder.js']
    }});
  } else {
      console.log("The user is NOT logged in");
      res.redirect('/');
  }
};

exports.tag = function(req, res){
  //only render the page if we are logged in the system
  if(req.session.auth && req.session.auth.loggedIn){
    res.render('tag', { locals: {
      title: 'Tag Manager'
      , scripts: ['javascript/tag.js']
    }});
  } else {
    console.log("The user is NOT logged in");
    res.redirect('/');
  }
};
