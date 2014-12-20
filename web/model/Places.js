/* Constants */

PLACE_TYPE_OPTIONS = [
  {value: "fablab", label: "FabLab"},
  {value: "wifi-cafe", label: "Wi-Fi Cafe"},
  {value: "meetup", label: "Meetup"},
  {value: "coworking", label: "Coworking Space"},
  {value: "hackerspace", label: "Hacker Space"},
  {value: "incubator", label: "Incubator"},
  {value: "other", label: "Other"},
]


/* PLACES */

Schemas.Place = new SimpleSchema([
  Schemas.default,
  Schemas.userId,
  Schemas.city,
  Schemas.private(false),
  Schemas.hiddenIn,
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
    "type": {
      type: "String",
      optional: true,
      allowedValues: _.pluck(PLACE_TYPE_OPTIONS, 'value'),
      autoform: { options: PLACE_TYPE_OPTIONS }
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
    },
  }
]);

// collection
Places = new Meteor.Collection('places');
Places.attachSchema(Schemas.Place)




/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove places.
// It is allowed to modify places from your own city only.

Places.allow({
  insert: function(userId, doc) {
    return hasAmbassadorPermission(userId, doc.city) || isOwner(userId, doc);
  },
  update: function(userId, doc, fieldNames, modifier) {
    return hasAmbassadorPermission(userId, doc.city) || isOwner(userId, doc);
  },
  remove: function(userId, doc) {
    return hasAmbassadorPermission(userId, doc.city) || isOwner(userId, doc);
  }
});





/* Publish */

// Publish all places, also other cities places

if (Meteor.isServer) {

  Meteor.publish("places", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (city === 'all' && isAdmin(user))
      return Places.find({});      
      
    if (user.city === city || isAdmin(user))
      return Places.find({$or: [{private: false}, {city: city}]});      

    return [];
  });
}






/* Methods */

Meteor.methods({
  'togglePlacesVisibility': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Places.update(id, _.object([action], [{hiddenIn: UserProp('currentCity')}]));
  },
  'togglePlacesPrivacy': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    Places.update(id, {$set: {private: toggle === 'on'}});
  }
})