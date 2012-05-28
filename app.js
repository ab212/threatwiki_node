var application_root = __dirname
  , routes = require("./routes")
  , model = require("./model")
  , express = require("express")
  , everyauth = require('everyauth')
  , mongoose = require('mongoose')
  , path = require("path")
  , util = require('util')
  // actions
  , soc_actions = require("./actions/soc_actions")
  , datapoint_actions = require("./actions/datapoint_actions")
  , tag_actions = require("./actions/tag_actions")
  //, user_actions = require("./actions/user_actions")
;

var app = module.exports = express.createServer();

everyauth.helpExpress(app);

// database
mongoose.connect('mongodb://localhost/namp', function(err) {
  if (err) throw err;
});


// create model
var createModel = model.createModel();
var SocModel = model.SocModel;
var DataPointModel = model.DataPointModel;
var TagModel = model.TagModel;
var UserModel = model.UserModel;

//using the informations we get back from Google Apps, we check if we already have this user in the DB, 
//if yes we return it, if not we create a new one
function addUser (sourceUser) {
  return UserModel.findOne({ email: sourceUser.email}, function (err, user){
      if (!err && user) {
        console.log("Found the user in DB with email: "+sourceUser.email);
        return user;
      } else if (!user) {
        console.log("Did not find the user in DB with email: "+sourceUser.email+" , creating new user in DB");
        //Did not find a user, create a new one
        user = new UserModel({
          name: sourceUser.name,
          email: sourceUser.email,
        });
        user.save(function (err) {
          if (!err) {
            return console.log("user created");
          } else {
            return console.log(err);
          }
        }); 
      } else {
        return console.log(err);
      }
    });
}

everyauth.google
  .appId('619120872838.apps.googleusercontent.com')
  .appSecret('aAE27lzFLKQi9QX-lFfToDbk')
  .scope('https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile') // What you want access to
  //TODO: redirect to our own auth-fail page
  //  .handleAuthCallbackError( function (req, res) {
  //})
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
    //only allow someone to login with an email that finish by thesentinelproject.org
    var splitemail = googleUserMetadata.email.split("@");
    var domain = splitemail[1];
    if (domain=='thesentinelproject.org'){
      googleUserMetadata.refreshToken = accessTokenExtra.refresh_token;
      googleUserMetadata.expiresIn = accessTokenExtra.expires_in;
      console.log(util.inspect(googleUserMetadata));
      return (addUser(googleUserMetadata));
    } else {
      console.log("Not the sentinel project domain name");
     return ['Not the sentinel project domain name'];
    }
  })
  .redirectPath('/soc'); //where to redirect after we get back from the login screen from google



// config
app.configure(function () {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser()); 
  app.use(express.session({ 'secret' : 'not sure what to put here' })); 
  app.use(everyauth.middleware());
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


// helpers
app.helpers({
});

// get routes
app.get('/', routes.index);
app.get('/soc', routes.soc);
app.get('/soc/create', routes.soc.create);
app.get('/datapoint', routes.datapoint);
app.get('/datapoint/create', routes.datapoint.create);
app.get('/tag', routes.tag);
app.get('/tag/create', routes.tag.create);

// import socActions
var socActions = soc_actions.load_socActions(app, SocModel);
var datapointActions = datapoint_actions.load_datapointActions(app, DataPointModel, TagModel);
var tagActions = tag_actions.load_tagActions(app, TagModel, DataPointModel);
//var userActions = user_actions.load_userActions(app, UserModel);


// server listen
app.listen(3000);
console.log("server's up at %d in %s mode", app.address().port, app.settings.env);
