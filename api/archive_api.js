//Sentinel Project archives every sources saved on each datapoints
//This API is useful to retrieve an archive sources, in case the original link was deleted
var express = require("express");

function load_archiveApi(app, websitemodel) {
  var WebsiteModel = websitemodel;

  // retrieve by id
  app.get('/api/archiveurl/:id', function (req, res) {
    return WebsiteModel.findById(req.params.id, function (err, archive) {
      if (!err && archive) {
        //remove javascript tag, in case it was still in the data
        archive.content=archive.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,' ');
        return res.jsonp(archive);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

  // retrieve by url, do not specify the http:// part
  app.get('/api/archiveurl/url/:url', function (req, res) {
    var url = 'http://'+req.params.url;
    return WebsiteModel.find({url: url}, function (err, archive) {
      if (!err && archive) {
        //remove javascript tag, in case it was still in the data
        archive.content=archive.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,' ');
        return res.jsonp(archive);
      } else {
        console.log(err);
        return res.send(null);
      }
    });
  });

}

exports.load_archiveApi = load_archiveApi;
