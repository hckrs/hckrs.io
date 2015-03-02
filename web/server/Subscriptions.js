

Meteor.publish('staff', function() {
  var query = {
    "roles.staff": {$size: {$gt: 0}}
  };
  var fields = Query.fieldsArray([
    "city",
    "isAmbassador",
    "profile",
    "roles",
    "staff",
  ]);
  return Users.find(query, {fields: fields});
});

Meteor.publish('ambassadors', function() {
  var query = {
    "isAmbassador": true
  };
  var fields = Query.fieldsArray([
    "city",
    "isAmbassador",
    "profile",
    "roles",
    "staff",
  ]);
  return Users.find(query, {fields: fields});
});
