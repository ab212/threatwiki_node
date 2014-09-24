var util = require('util');
var moment = require('moment');
var jquery = require('jquery');
var secretkey = '123';

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

  var host = 'http://localhost:3000/';
  var port = 3000;

  exports.soc = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){

      jquery.getJSON(host+'api/soc'+'?secretkey='+secretkey+'&callback=?', function(socs) {
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
          jquery.getJSON(host+'api/datapoint/soc/'+ socs[i].title +'?secretkey='+secretkey+'&callback=?', function(datapoints) {
            //sort DESC date by created date to get the most recent datapoint created
            datapoints.sort(function(a,b){return new Date(b.created)-new Date(a.created);});
            if (typeof(datapoints[0]) != 'undefined')  {
                datapoints[0].created = moment(datapoints[0].created).format("YYYY-MM-DD");
            }
            resultsDatapoints.push(datapoints[0]);
            //Call render only when we are done with all the API calls
            if(resultsDatapoints.length == socs.length) {
              render();
            }
          });
        }
        if (socs.length < 1) {
          render();
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

      jquery.getJSON(host+'api/soc/'+ obj_id +'?secretkey='+secretkey+'&callback=?', function(soc) {
        soc.created = moment(soc.created).format("YYYY-MM-DD");
        soc.modified = moment(soc.modified).format("YYYY-MM-DD");
        res.render('socForm',  {
          title: 'Sentinel Project: Edit SOC '+soc.displayname,
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
        //support multiple tag in the URL, delimited by commas
        tagname = tagname.split(',');
        jquery.getJSON(host+'api/datapoint/tag/'+ tagname +'?secretkey='+secretkey+'&callback=?', function(datapoints) {
          jquery.getJSON(host+'api/soc/title/'+ socname +'?secretkey='+secretkey+'&callback=?', function(soc) {
            jquery.getJSON(host+'api/tag/'+ tagname +'?secretkey='+secretkey+'&callback=?', function(tag) {
              var tagsavailable=[];
              var tagstitle = [];

              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("YYYY-MM-DD");
                datapoints[i].modified = moment(datapoints[i].modified).format("YYYY-MM-DD");
                datapoints[i].event_date = moment(datapoints[i].event_date).format("YYYY-MM-DD");
                if (typeof(datapoints[i].tags) != 'undefined'){
                  //We create the list of tags on the left for the subset of datapoints that are currently presented
                  //we make sure we don't double the tags and don't include the tag already use for refinement
                  //IE 7-8 not compatible
                  for (j=0;j<datapoints[i].tags.length;j++){
                    if (tagstitle.indexOf(datapoints[i].tags[j].title) == -1 && tagname.indexOf(datapoints[i].tags[j]._id) == -1){
                      tagsavailable.push(datapoints[i].tags[j]);
                      tagstitle.push(datapoints[i].tags[j].title);
                    }
                  }
                }
              }
              res.render('socView', {
                  title: 'Sentinel Project: View SOC '+soc.displayname,
                  datapoints: datapoints,
                  soc:soc,
                  tag:tag,
                  tagsavailable:tagsavailable,
                  tagurl:req.query["tag"]
              });
            });
          });
        });
      } else {
        jquery.getJSON(host+'api/datapoint/soc/'+ socname +'?secretkey='+secretkey+'&callback=?', function(datapoints) {
          jquery.getJSON(host+'api/soc/title/'+ socname +'?secretkey='+secretkey+'&callback=?', function(soc) {
            jquery.getJSON(host+'api/tag/soc/'+ socname +'?secretkey='+secretkey+'&callback=?', function(tagsavailable) {
              for(i=0; i<datapoints.length; i++) {
                datapoints[i].created = moment(datapoints[i].created).format("YYYY-MM-DD");
                datapoints[i].modified = moment(datapoints[i].modified).format("YYYY-MM-DD");
                datapoints[i].event_date = moment(datapoints[i].event_date).format("YYYY-MM-DD");
              }
              res.render('socView', {
                  title: 'Sentinel Project: View SOC '+soc.displayname,
                  datapoints: datapoints,
                  soc:soc,
                  tagsavailable:tagsavailable
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
      jquery.getJSON(host+'api/datapoint'+'?secretkey='+secretkey+'&callback=?', function(datapoints) {
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
        jquery.getJSON(host+'api/tag/'+ tagid +'?secretkey='+secretkey+'&callback=?', function(tag) {
          jquery.getJSON(host+'api/soc/title/'+ socname +'?secretkey='+secretkey+'&callback=?', function(soc) {
            res.render('datapointForm', {
              title: 'Sentinel Project: Create Datapoint for SOC '+soc.displayname,
              socname:socname,
              soc:soc,
              tag:tag
            });
          });
        });
      } else {
        jquery.getJSON(host+'api/soc/title/'+ socname +'?secretkey='+secretkey+'&callback=?', function(soc) {
          res.render('datapointForm', {
              title: 'Sentinel Project: Create Datapoint for SOC '+socname,
              socname:socname,
              soc:soc,
              tag:tagid
            });
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

      jquery.getJSON(host+'api/datapoint/'+ obj_id +'?secretkey='+secretkey+'&callback=?', function(datapoint) {
        jquery.getJSON(host+'api/soc/title/'+ datapoint.soc +'?secretkey='+secretkey+'&callback=?', function(soc) {

          datapoint.created = moment(datapoint.created).format("YYYY-MM-DD");
          datapoint.modified = moment(datapoint.modified).format("YYYY-MM-DD");
          datapoint.event_date = moment(datapoint.event_date).format("YYYY-MM-DD");

          res.render('datapointForm', {
            title: 'Sentinel Project: Edit Datapoint '+datapoint.title,
            datapoint: datapoint,
            soc:soc
          });
        });
      });
    } else {
        //force logout if user doesn't meet conditions to view the page
        res.redirect('/logout');
    }
  };

  exports.tag = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      jquery.getJSON(host+'api/tag+'+'?secretkey='+secretkey+'&callback=?', function(tags) {
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
      jquery.getJSON(host+'api/soc/title/'+ socname +'?secretkey='+secretkey+'&callback=?', function(soc) {
        res.render('tagForm', {
          title: 'Sentinel Project: Create Tag',
          socname: socname,
          soc:soc
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.tag.edit = function(req, res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      jquery.getJSON(host+'api/tag/'+ obj_id +'?secretkey='+secretkey+'&callback=?', function(tag) {
        jquery.getJSON(host+'api/soc/title/'+ tag[0].soc +'?secretkey='+secretkey+'&callback=?', function(soc) {
          res.render('tagForm', {
            title: 'Sentinel Project: Edit Tag '+tag.title,
            tag: tag,
            soc:soc
          });
         });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  };

  exports.iranvisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('irancontainer', {
          title: 'Iran Visualization'
        });
    } else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('iranpublic', {
          title: "Visualization of the Persecution of the Bahá'ís community in Iran - The Sentinel Project"
      });

    }
  };

  exports.nigeriavisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('nigeriacontainer', {
          title: 'Nigeria Visualization'
        });
    } 
    /*else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('nigeriapublic', {
          title: "Visualization of the Persecution of the Bahá'ís community in Iran - The Sentinel Project"
      });

    }*/
  };

  exports.southsudanvisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('southsudancontainer', {
          title: 'South Sudan Visualization'
        });
    } 
    /*else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('southsudanpublic', {
          title: "Visualization of the Persecution of the Bahá'ís community in Iran - The Sentinel Project"
      });

    }*/
  };

  exports.centralafricanrepublicvisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('centralafricanrepubliccontainer', {
          title: 'Central African Republic Visualization'
        });
    } 
    /*else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('centralafricanrepublicpublic', {
          title: "Visualization of the Persecution of the Bahá'ís community in Iran - The Sentinel Project"
      });

    }*/
  };

  exports.burmavisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('burmacontainer', {
          title: "Visualization of the Persecution of the Rohingya community in Burma - The Sentinel Project"
        });
    } else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('burmapublic', {
          title: "Visualization of the Persecution of the Rohingya community in Burma - The Sentinel Project"
      });

    }
  };

  exports.kenyavisualization = function(req, res){
    //if we are logged in, we present the normal view, if we are not, we have a different view without the menu
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
        res.render('kenyacontainer', {
          title: "Visualization of Atrocities and Intercommunal Violence in Kenya - The Sentinel Project"
        });
    } else {
      //Public access to the Visualization page without being logged in on Threatwiki
      res.render('kenyapublic', {
          title: "Visualization of Atrocities and Intercommunal Violence in Kenya - The Sentinel Project"
      });
    }
  };

  exports.archiveurl = function (req,res){
    if((app.settings.env == 'development') ? (!authenticate(req, res)) : (authenticate(req, res))){
      var obj_id = req.query["id"];
      jquery.getJSON(host+'api/archiveurl/'+ obj_id + '?callback=?', function(archiveurl) {
        res.render('archiveViewer', {
          title: 'Sentinel Project: View Archived URL',
          archiveurl: archiveurl
        });
      });
    } else {
      //force logout if user doesn't meet conditions to view the page
      res.redirect('/logout');
    }
  }
}

exports.notFound = function(req, res){
  res.status(404);
  if(req.accepts('html')){
    res.render('404', {title: '404: Not Found', url: req.url });
  }
  else if(req.accepts('json')){
    res.json({ error: '404: Not Found' });
  }
  else{
    res.send('404: Not Found');
  }
};

exports.serverError = function(err, req, res, next){
  err.status = err.status || 500;
  res.status(err.status);
  if(req.accepts('html')){
    res.render('500', { title: 'Server Error', url: req.url, err: err });
  }
  else if(req.accepts('json')){
    res.json({ error: err.status });
  }
  else{
    res.send(err.status + ': Server Error');
  }
};

exports.load_routes = load_routes;
