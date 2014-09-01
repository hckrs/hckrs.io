
/* HIGHLIGHTS */

Schemas.Highlight = new SimpleSchema([
  Schemas.default,
  Schemas.userId,
  Schemas.private(true),
  Schemas.hiddenIn,
  Schemas.city,
  {
    "imageUrl": {
      type: String,
      label: 'Image URL'
    },
    "title": {
      type: String,
      label: 'Name'
    },
    "subtitle": {
      type: String,
      optional: true,
      label: 'Information'
    },
    "url": {
      type: String,
      optional: true,
      regEx: SimpleSchema.RegEx.Url,
      autoValue: AutoValue.prefixUrlWithHTTP,
      label: 'Website URL'
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
    return hasAmbassadorPermission(userId, doc.city);
  },
  update: function(userId, doc, fieldNames, modifier) {
    return hasAmbassadorPermission(userId, doc.city);
  },
  remove: function(userId, doc) {
    return hasAmbassadorPermission(userId, doc.city);
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

    if (city === 'all' && user.isAdmin)
      return Highlights.find({});      

    if (user.currentCity === city)
      return Highlights.find({$or: [{private: false}, {city: city}]});      

    return [];
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
    if (!hasAmbassadorPermission()) return;
    HighlightsSort.upsert({city: UserProp('currentCity')}, {$set: {sort: sort}});
  },
  'toggleHighlightsVisibility': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Highlights.update(id, _.object([action], [{hiddenIn: UserProp('currentCity')}]));
  },
  'toggleHighlightsPrivacy': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    Highlights.update(id, {$set: {private: toggle === 'on'}});
  }
})


