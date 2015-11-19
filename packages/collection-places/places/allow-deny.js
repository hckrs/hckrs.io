
/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove places.
// It is allowed to modify places from your own city only.

Places.allow({
  insert: function(userId, doc) {
    return Users.hasAmbassadorPermission(userId, doc.city) || Users.isOwner(userId, doc);
  },
  update: function(userId, doc, fieldNames, modifier) {
    return Users.hasAmbassadorPermission(userId, doc.city) || Users.isOwner(userId, doc);
  },
  remove: function(userId, doc) {
    return Users.hasAmbassadorPermission(userId, doc.city) || Users.isOwner(userId, doc);
  }
});