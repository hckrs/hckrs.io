
/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove highlights.
// It is only allowed to attach the highlights that are visible for this user.

Highlights.allow({
  insert: function(userId, doc) {
    return Users.hasAmbassadorPermission(userId, doc.city);
  },
  update: function(userId, doc, fieldNames, modifier) {
    return Users.hasAmbassadorPermission(userId, doc.city);
  },
  remove: function(userId, doc) {
    return Users.hasAmbassadorPermission(userId, doc.city);
  }
});