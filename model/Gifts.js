
/* GIFTS */

Schemas.Gifts = new SimpleSchema([
  Schemas.default,
  Schemas.city,
  {
    "global": {
      type: Boolean
    },
    "title": {
      type: String
    },
    "description": {
      type: String,
      optional: true
    },
    "websiteUrl": {
      type: String,
      optional: true,
      autoValue: AutoValue.prefixUrlWithHTTP
    },
    "websiteName": {
      type: String,
      optional: true
    },
    "code": {
      type: String,
      optional: true
    }
  }
]);

Gifts = new Meteor.Collection('gifts', {
  schema: Schemas.Gifts,
  transform: function(doc) {
    doc.isForeign = isForeign(doc);
    return doc;
  }
});



/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove gifts.
// It is only allowed to attach the gifts that are visible for this user.

Gifts.allow({
  insert: function(userId, doc) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.global || doc.city === user.currentCity);
  },
  update: function(userId, doc, fieldNames, modifier) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.global || doc.city === user.currentCity);
  },
  remove: function(userId, doc) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.global || doc.city === user.currentCity);
  }
});



/* Publish */

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // Only publish gifts for the city the user is visiting
  Meteor.publish("gifts", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (user.currentCity !== city)
      return []; 

    return Gifts.find({$or: [{global: true}, {city: city}]});
  });
}




