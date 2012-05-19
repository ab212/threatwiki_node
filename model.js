var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function createModel() {
  var DataPoint = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    , latitude: { type: String, required: true }
    , longitude: { type: String, required: true }
    , soc: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
    // foreign key
    , tags     : [{ type: ObjectId, ref: 'Tag' }]   
  });

  var Soc = new Schema ({
      title: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
    });

  var Tag = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: false }
    , modified: { type: Date, default: Date.now }
    , soc: { type: String, required: true }
  });

  // model definitions
  var SocModel = mongoose.model('Soc', Soc);
  var DataPointModel = mongoose.model('DataPoint', DataPoint);
  var TagModel = mongoose.model('Tag', Tag);

  // model exports
  exports.SocModel = SocModel;
  exports.DataPointModel = DataPointModel;
  exports.TagModel = TagModel;
}

exports.createModel = createModel;
