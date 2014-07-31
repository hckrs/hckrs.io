
/* HIGHLIGHTS */

Schemas.Highlight = new SimpleSchema([
  Schemas.default,
  Schemas.userId,
  Schemas.city,
  {
    "global": {
      type: Boolean
    },
    "imageUrl": {
      type: String
    },
    "title": {
      type: String
    },
    "subtitle": {
      type: String,
      optional: true
    },
    "website": {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP
    },
    "hiddenIn": {
      type: [String],
      allowedValues: CITYKEYS,
      optional: true
    },
  }
]);

Highlights = new Meteor.Collection('highlights', {
  schema: Schemas.Highlight
});


/* sort */

Schemas.HighlightsSort = new SimpleSchema([
  Schemas.city,
  {
    "sort": {
      type: [SimpleSchema.RegEx.Id]
    }
  }
])

HighlightsSort = new Meteor.Collection('highlightsSort', {
  schema: Schemas.HighlightsSort
});



/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove highlights.
// It is only allowed to attach the highlights that are visible for this user.

Highlights.allow({
  insert: function(userId, doc) {
    var user = Users.findOne(userId);
    return user.isAdmin || (user.ambassador && doc.city === user.currentCity);
  },
  update: function(userId, doc, fieldNames, modifier) {
    var user = Users.findOne(userId);
    return user.isAdmin || (user.ambassador && doc.city === user.currentCity);
  },
  remove: function(userId, doc) {
    var user = Users.findOne(userId);
    return user.isAdmin || (user.ambassador && doc.city === user.currentCity);
  }
});





/* Publish */

// Publish the highlights that are global and attached to the current city.

if (Meteor.isServer) {

  // Only publish highlights for the city the user is visiting
  Meteor.publish("highlights", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (user.currentCity !== city)
      return []; 

    return Highlights.find({$or: [{global: true}, {city: city}]});
  });

  // Only publish sortings for the city the user is visiting
  Meteor.publish("highlightsSort", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (user.currentCity !== city)
      return []; 

    return HighlightsSort.find({city: city});
  });
}



/* Methods */

Meteor.methods({
  'updateHighlightsSort': function(sort) {
    if (!Meteor.user()) return;
    if (!Meteor.user().isAdmin && !Meteor.user().ambassador) return;
    HighlightsSort.upsert({city: Meteor.user().currentCity}, {$set: {sort: sort}});
  }
})


