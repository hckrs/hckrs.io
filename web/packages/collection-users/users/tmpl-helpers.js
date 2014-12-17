
Template.registerHelper('UserProp', function(user, prop) {
  return Users.prop(user, prop);
});
Template.registerHelper('MyProp', function(prop) {
  return Users.myProp(prop);
});

Template.registerHelper('hasAmbassadorPermission', function() {
  return Users.hasAmbassadorPermission();
});
Template.registerHelper('hasAdminPermission', function() {
  return Users.hasAdminPermission();
});

Template.registerHelper('UserView', function(user) {
  return Users.userView(user);
});
Template.registerHelper('UserRank', function(user) {
  return Users.userRank(user);
});
Template.registerHelper('UserSocialName', function(user, service) {
  return Users.userSocialName(user, service);
});
Template.registerHelper('UserProfileUrl', function(user) {
  return Users.userProfileUrl(user);
});