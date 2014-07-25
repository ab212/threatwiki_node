if(process.env.NODETIME_ACCOUNT_KEY) {
  require('nodetime').profile({
    accountKey: process.env.NODETIME_ACCOUNT_KEY,
    appName: 'Threatwiki' // optional
  });
}
var application_root = __dirname
  , routes = require("./routes")
  , model = require("./model")
  , express = require("express")
  , everyauth = require('everyauth')
  , mongoose = require('mongoose')
  , path = require("path")
  , util = require('util')
  // api
  , soc_api = require("./api/soc_api")
  , datapoint_api = require("./api/datapoint_api")
  , tag_api = require("./api/tag_api")
  , archive_api = require("./api/archive_api")
  //, user_api = require("./api/user_api")
;
var app = express();


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
var WebsiteModel = model.WebsiteModel;

//using the informations we get back from Google Apps, we check if we already have this user in the DB,
//if yes we return it, if not we create a new one
function addOrGetUser (sourceUser) {
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
          created : Date.now(),
          modified: Date.now()
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
      return (addOrGetUser(googleUserMetadata));
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
  app.use(express.compress());
  app.use(express.bodyParser());
  app.use(express.cookieParser('secret'));
  //TODO: Will need to specify a memorystore to go in PROD (see warning in log when deploying in PROD)
  app.use(express.session());
  app.use(everyauth.middleware(app));
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));

  // catch 404 errors
  app.use(routes.notFound);
  app.use(routes.serverError);
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});


// get routes
routes.load_routes(app);
routes.authenticate;
app.get('/', routes.index);
app.get('/soc', routes.soc);
app.get('/soc/create', routes.soc.create);
app.get('/soc/view', routes.soc.view);
app.get('/soc/edit', routes.soc.edit);
app.get('/datapoint', routes.datapoint);
app.get('/datapoint/create', routes.datapoint.create);
app.get('/datapoint/edit', routes.datapoint.edit);
app.get('/tag', routes.tag);
app.get('/tag/create', routes.tag.create);
app.get('/tag/edit', routes.tag.edit);

app.get('/iranvisualization',routes.iranvisualization);
app.get('/burmavisualization',routes.burmavisualization);
app.get('/kenyavisualization',routes.kenyavisualization);
app.get('/archiveurl',routes.archiveurl);

// import socApi
var socApi = soc_api.load_socApi(app, SocModel,UserModel,DataPointModel,TagModel);
var datapointApi = datapoint_api.load_datapointApi(app, DataPointModel, TagModel, UserModel,SocModel,WebsiteModel);
var tagApi = tag_api.load_tagApi(app, TagModel, DataPointModel,UserModel);
var archiveApi = archive_api.load_archiveApi(app,WebsiteModel);

// server listen
app.listen(3000);
//console.log("server's up at %d in %s mode", app.address().port, app.settings.env);
console.log("server's up in %s mode", app.settings.env);
