
/* PLACES */

Schemas.Place = new SimpleSchema([
  Schemas.default,
  Schemas.city,
  {
    "title": {
      type: String,
      optional: true
    },
    "description": {
      type: String,
      optional: true
    },
    "url": {
      type: String,
      optional: true,
      autoValue: AutoValue.prefixUrlWithHTTP
    },
    "location": {
      type: Object
    },
    "location.lat": {
      type: Number,
      decimal: true
    },
    "location.lng": {
      type: Number,
      decimal: true
    }
  }
]);

Places = new Meteor.Collection('places', {
  schema: Schemas.Place,
  transform: function(doc) {
    doc.isForeign = isForeign(doc);
    return doc;
  }
});



/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove places.
// It is allowed to modify places from your own city only.

Places.allow({
  insert: function(userId, doc) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.city === user.currentCity);
  },
  update: function(userId, doc, fieldNames, modifier) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.city === user.currentCity);
  },
  remove: function(userId, doc) {
    var user = Users.findOne(userId);
    return (user.isAdmin || user.ambassador) && (doc.city === user.currentCity);
  }
});





/* Publish */

// Publish all places, also other cities places

if (Meteor.isServer) {

  Meteor.publish("places", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    return Places.find({});
  });
}




