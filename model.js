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
    , modified: { type: Date, required: true }
    , created: { type: Date, required: true }
    // foreign key
    , tags      : [{ type: ObjectId, ref: 'Tag' }]   
    , createdBy : { type: ObjectId, ref: 'User' }
    , modifiedBy : { type: ObjectId, ref: 'User' }
  });

  var Soc = new Schema ({
      title: { type: String, required: true }
    , modified: { type: Date, required: true }
    , created: { type: Date, required: true }
    , createdBy : { type: ObjectId, ref: 'User' }
    , modifiedBy : { type: ObjectId, ref: 'User' }
    });


  var Tag = new Schema ({
      title: { type: String, required: true }
    , description: { type: String, required: false }
    , modified: { type: Date, required: true }
    , created: { type: Date, required: true }
    , soc: { type: String, required: true }
    , createdBy : { type: ObjectId, ref: 'User' }
    , modifiedBy : { type: ObjectId, ref: 'User' }
  });

  //used for user authentication, can't have more than 1 user with same email
   var User = new Schema ({
      name: { type: String, required: true }
    , email: { type: String, required: true, unique: true }
    , modified: { type: Date, required: true }
    , created: { type: Date, required: true }
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
