
var userFields = [
  "city",
  "globalId",
  "profile.picture",
  "profile.name",
];

var staffFields = [
  "isAmbassador",
  "roles",
  "staff",
]




Meteor.publish('staff', function() {
  var query = {$and: [
    {"roles.staff": {$exists: true}},
    {"roles.staff": {$not: {$size: 0}}}
  ]};
  var fields = Query.fieldsArray(_.union(userFields, staffFields));
  return Users.find(query, {fields: fields});
});

Meteor.publish('ambassadors', function() {
  var query = {
    "isAmbassador": true
  };
  var fields = Query.fieldsArray(_.union(userFields, staffFields));
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

Meteor.publish('inviteBroadcastUser', function(inviteBitHash) {
  var invitePhrase = inviteBitHash ? Url.bitHashInv(inviteBitHash) : 0;
  var fields = Query.fieldsArray(_.union(userFields, ['invitationPhrase']));
  return !invitePhrase ? [] : Users.find({invitationPhrase: invitePhrase}, {fields: fields, limit: 1});
});
