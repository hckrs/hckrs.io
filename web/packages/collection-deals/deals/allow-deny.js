/* Permissions */

// Only ambassadors and admins are allowed to insert/update/remove deals.
// It is only allowed to attach the deals that are visible for this user.

Deals.allow({
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