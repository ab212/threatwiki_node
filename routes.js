// define new routes here

exports.index = function(req, res){
  res.render('index', { locals: {
    title: 'Threatwiki'
    , scripts: []
  }});
};

exports.soc = function(req, res){
  res.render('soc', { locals: {
    title: 'SOC Manager'
    , scripts: ['javascript/soc.js']
  }});
};

exports.datapoint = function(req, res){
  res.render('datapoint', { locals: {
    title: 'Datapoint Manager'
    , scripts: ['javascript/datapoint.js', 'http://maps.googleapis.com/maps/api/js?sensor=false&key=AIzaSyCdCNPG_4JmvjQjbXVyB_W6Ena7b7CIqns&sensor=false', 'javascript/jquery.auto-geocoder.js']
  }});
};

exports.tag = function(req, res){
  res.render('tag', { locals: {
    title: 'Tag Manager'
    , scripts: ['javascript/tag.js']
  }});
};
