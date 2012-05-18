// define new routes here

exports.index = function(req, res){
  res.render('index', { title: 'ThreatWiki' })
};

exports.soc = function(req, res){
  res.render('soc', { title: 'SOC Manager' })
};

exports.datapoint = function(req, res){
  res.render('datapoint', { title: 'Datapoint Manager' })
};

exports.tag = function(req, res){
  res.render('tag', { title: 'Tag Manager' })
};
