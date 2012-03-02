var mongoose = require('mongoose');
var Schema = mongoose.Schema;

function createModel() {
  var Soc = new Schema({
      title: { type: String, required: true }
    , description: { type: String, required: false }
    , modified: { type: Date, default: Date.now }
  });

  var DataPoint = new Schema({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    , location: [Location]
    , tag: [Tag]
    , soc: [Soc]
    , modified: { type: Date, default: Date.now }
  });

  var Location = new Schema({
      title: { type: String, required: true }
    , latitude: { type: String, required: true }
    , longitude: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
  });

  var Tag = new Schema({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
  });

  // model definitions
  var SocModel = mongoose.model('Soc', Soc);
  var DataPointModel = mongoose.model('DataPoint', DataPoint);
  var LocationModel = mongoose.model('Location', Location);
  var TagModel = mongoose.model('Tag', Tag);

  // model exports
  exports.SocModel = SocModel;
  exports.DataPointModel = DataPointModel;
  exports.LocationModel = LocationModel;
  exports.TagModel = TagModel;
}

exports.createModel = createModel;
