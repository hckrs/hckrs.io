

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

// Publish locations of hackers anonymously
// by only publish a collection with coordinates
Meteor.publish('mapHackersLocations', function(options) {
  var self = this, options = options || {};

  var selector = {
    "profile.location.lat": {$type: 1},
    "profile.location.lng": {$type: 1},
  };

  if (options.excludeCity)
    selector.city = {$ne: options.excludeCity};

  var handle = Users.find(selector, {fields: {"profile.location": true}}).observeChanges({
    added: function(id, user) {
      self.added('mapHackersLocations', Random.id(), user.profile.location);
    }
  });

  self.ready();

  self.onStop(function () {
    handle.stop();
  });
});
