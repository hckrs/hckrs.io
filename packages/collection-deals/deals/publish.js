var options = {fields: Query.fieldsArray(UserFields.permissionDeps)};

// Only publish deals for the city the user is visiting
Meteor.publish("deals", function (city) {
  var user = Users.findOne(this.userId, options);

  if(!user || !Users.allowedAccess(user))
    return [];

  if (city === 'all' && Users.isAdmin(user))
    return Deals.find({});

  if (user.city === city || Users.isAdmin(user))
    return Deals.find({$or: [{private: false}, {city: city}]});

  return [];
});

// Only publish sortings for the city the user is visiting
Meteor.publish("dealsSort", function (city) {
  var user = Users.findOne(this.userId, options);

  if(!user || !Users.allowedAccess(user))
    return [];

  if (user.city === city || Users.isAdmin(user))
    return DealsSort.find({city: city});

  return [];
});
