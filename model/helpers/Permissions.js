
// helper functions

// check if user is allowed to access the site
// otherwise all database modifier functions will be blocked
allowedAccess = function(userId) {
  var user = Users.findOne(userId);
  return user && user.isAccessDenied != true;
}