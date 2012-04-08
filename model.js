var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function createModel() {

  var DataPoint = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    //foreign key
    , tags     : [{ type: ObjectId, ref: 'Tag' }]   
     //location is optional
    , latitude: { type: String }
    , longitude: { type: String}
    , soc: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
       
  });
  
  //the SOC collection right now is just being used for when we want to create new SOCs or list the current ones
  //we also include SOC name directly into data points
    var Soc = new Schema ({
        title: { type: String, required: true }
      , modified: { type: Date, default: Date.now }
    });

  var Tag = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
    , soc: { type: String, required: true }
    //location is optional
    , latitude: { type: String }
    , longitude: { type: String}
    //foreign key
    //, datapoints     : [{ type: ObjectId, ref: 'DataPoint' }]   

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
