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
    , scripts: ['soc.js']
  }});
};

exports.datapoint = function(req, res){
  res.render('datapoint', { locals: {
    title: 'Datapoint Manager'
    , scripts: ['datapoint.js', 'jquery.auto-geocoder.js']
  }});
};

exports.tag = function(req, res){
  res.render('tag', { locals: {
    title: 'Tag Manager'
    , scripts: ['tag.js']
  }});
};
