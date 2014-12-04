
/* GIFTS */

Schemas.Deal = new SimpleSchema([
  Schemas.default,
  Schemas.city,
  Schemas.userId,
  Schemas.private(true),
  Schemas.hiddenIn,
  {
    "title": {
      type: String,
      label: 'Deal description'
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
      label: 'Deal code / URL'
    },
  }
]);


// collection
Deals = new Meteor.Collection('deals');
Deals.attachSchema(Schemas.Deal)


/* sort */

Schemas.DealsSort = new SimpleSchema([
  Schemas.city,
  {
    "sort": {
      type: [SimpleSchema.RegEx.Id]
    }
  }
])

DealsSort = new Meteor.Collection('dealsSort', {
  schema: Schemas.DealsSort
});





/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove deals.
// It is only allowed to attach the deals that are visible for this user.

Deals.allow({
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

  // Only publish deals for the city the user is visiting
  Meteor.publish("deals", function (city) {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];  

    if (city === 'all' && isAdmin(user))
      return Deals.find({});

    if (user.city === city || isAdmin(user))
      return Deals.find({$or: [{private: false}, {city: city}]});

    return [];
  });

  // Only publish sortings for the city the user is visiting
  Meteor.publish("dealsSort", function (city) {
    var user = Users.findOne(this.userId);
    
    if(!user || !allowedAccess(user._id))
      return [];  

    if (user.city === city || isAdmin(user))
      return DealsSort.find({city: city}); 

    return [];
  });
}



/* Methods */

Meteor.methods({
  'updateDealsSort': function(sort) {
    if (!hasAmbassadorPermission()) return;
    DealsSort.upsert({city: UserProp('currentCity')}, {$set: {sort: sort}});
  },
  'toggleDealsVisibility': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Deals.update(id, _.object([action], [{hiddenIn: UserProp('currentCity')}]));
  },
  'toggleDealsPrivacy': function(id, toggle) {
    if (!hasAmbassadorPermission()) return;
    Deals.update(id, {$set: {private: toggle === 'on'}});
  }
})



