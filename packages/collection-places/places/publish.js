var options = {fields: Query.fieldsArray(UserFields.permissionDeps)};

Meteor.publish("places", function (city) {
  var user = Users.findOne(this.userId, options);

  if(!user || !Users.allowedAccess(user))
    return [];

  if (city === 'all' && Users.isAdmin(user))
    return Places.find({});

  if (user.city === city || Users.isAdmin(user))
    return Places.find({$or: [{private: false}, {city: city}]});

  return [];
});
