var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

function createModel() {
  var DataPoint = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: true }
    , Location: {
        title: { type: String, required: true }
      , latitude: { type: String, required: true }
      , longitude: { type: String, required: true }
      }
    , soc: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
    , created: { type: Date, default: Date.now }
    // foreign key
    , tags     : [{ type: ObjectId, ref: 'Tag' }]   
  });

  var Soc = new Schema ({
      title: { type: String, required: true }
    , modified: { type: Date, default: Date.now }
    , created: { type: Date, default: Date.now }
    });


  var Tag = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: false }
    , modified: { type: Date, default: Date.now }
    , created: { type: Date, default: Date.now }
    , soc: { type: String, required: true }
  });
  //used for user authentication, can't have more than 1 user with same email
   var User = new Schema ({
      name: { type: String, required: true }
    , email: { type: String, required: true, unique: true }
    , modified: { type: Date, default: Date.now }
    , created: { type: Date, default: Date.now }
  });

  // model definitions
  var SocModel = mongoose.model('Soc', Soc);
  var DataPointModel = mongoose.model('DataPoint', DataPoint);
  var TagModel = mongoose.model('Tag', Tag);
  var UserModel = mongoose.model('User', User);


  // model exports
  exports.SocModel = SocModel;
  exports.DataPointModel = DataPointModel;
  exports.TagModel = TagModel;
  exports.UserModel = UserModel;
}

exports.createModel = createModel;
