
/* GIFTS */

Schemas.Gifts = new SimpleSchema([
  Schemas.default,
  Schemas.city,
  Schemas.userId,
  {
    "global": {
      type: Boolean,
      label: 'Show in all citys'
    },
    "title": {
      type: String,
      label: 'Discount description'
    },
    "description": {
      type: String,
      optional: true,
      label: 'Extra information'
    },
    "url": {
      type: String,
      optional: true,
      autoValue: AutoValue.prefixUrlWithHTTP,
      label: 'Company URL'
    },
    "code": {
      type: String,
      optional: true,
      label: 'Discount code / URL'
    },
    "hiddenIn": {
      type: [String],
      allowedValues: CITYKEYS,
      optional: true
    },
  }
]);

Gifts = new Meteor.Collection('gifts', {
  schema: Schemas.Gifts
});


/* sort */

Schemas.GiftsSort = new SimpleSchema([
  Schemas.city,
  {
    "sort": {
      type: [SimpleSchema.RegEx.Id]
    }
  }
])

GiftsSort = new Meteor.Collection('giftsSort', {
  schema: Schemas.GiftsSort
});





/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove gifts.
// It is only allowed to attach the gifts that are visible for this user.

Gifts.allow({
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

// Publish the fits that are global and attached to the current city.

if (Meteor.isServer) {

  // Only publish gifts for the city the user is visiting
  Meteor.publish("gifts", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (city === 'all' && user.isAdmin)
      return Gifts.find({});

    if (user.currentCity === city)
      return Gifts.find({$or: [{global: true}, {city: city}]});

    return [];
  });

  // Only publish sortings for the city the user is visiting
  Meteor.publish("giftsSort", function (city) {
    var user = Users.findOne(this.userId);
    
    if(!user || !allowedAccess(user._id))
      return [];  

    if (user.currentCity !== city)
      return []; 

    return GiftsSort.find({city: city});
  });
}



/* Methods */

Meteor.methods({
  'updateGiftsSort': function(sort) {
    if (!hasAmbassadorPermission()) return;
    GiftsSort.upsert({city: UserProp('currentCity')}, {$set: {sort: sort}});
  },
  'toggleGiftsVisibility': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Gifts.update(id, _.object([action], [{hiddenIn: UserProp('currentCity')}]));
  }
})



