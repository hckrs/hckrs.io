
/* GIFTS */

Schemas.Gifts = new SimpleSchema([
  Schemas.default,
  Schemas.city,
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
    "websiteUrl": {
      type: String,
      optional: true,
      autoValue: AutoValue.prefixUrlWithHTTP,
      label: 'Website / redeem URL'
    },
    "websiteName": {
      type: String,
      optional: true,
      label: 'Company'
    },
    "code": {
      type: String,
      optional: true,
      label: 'Discount code'
    },
    "hiddenIn": {
      type: [String],
      allowedValues: CITYKEYS,
      optional: true
    },
  }
]);

Gifts = new Meteor.Collection('gifts', {
  schema: Schemas.Gifts,
  transform: function(doc) {
    doc.isForeign = isForeign(doc);
    return doc;
  }
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
    if (!Meteor.user()) return;
    if (!Meteor.user().isAdmin && !Meteor.user().ambassador) return;
    GiftsSort.upsert({city: Meteor.user().currentCity}, {$set: {sort: sort}});
  }
})



