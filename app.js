var application_root = __dirname
  , routes = require("./routes")
  , model = require("./model")
  , express = require("express")
  , mongoose = require('mongoose')
  , path = require("path")
  // actions
  , soc_actions = require("./actions/soc_actions")
  , datapoint_actions = require("./actions/datapoint_actions")
  , tag_actions = require("./actions/tag_actions")
;

var app = module.exports = express.createServer();

// database
mongoose.connect('mongodb://localhost/namp', function(err) {
  if (err) throw err;
});

// config
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});

// create model
var createModel = model.createModel();
var SocModel = model.SocModel;
var DataPointModel = model.DataPointModel;
var TagModel = model.TagModel;

// helpers
app.helpers({
});

// get routes
app.get('/', routes.index);
app.get('/soc', routes.soc);
app.get('/datapoint', routes.datapoint);
app.get('/tag', routes.tag);

// import socActions
var socActions = soc_actions.load_socActions(app, SocModel);
var datapointActions = datapoint_actions.load_datapointActions(app, DataPointModel, TagModel);
var tagActions = tag_actions.load_tagActions(app, TagModel);

// server listen
app.listen(3000);
console.log("server's up at %d in %s mode", app.address().port, app.settings.env);
