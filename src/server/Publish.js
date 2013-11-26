
/* publishing database data to the client */




/* USER DATA */

// we define multiple publish rules for userdata.
// the priority of rules is from top to bottom
// 1. current logged in user
// 2. users with public e-mailaddress
// 3. otherwise only the default public user data is published
// when a user match a rule it will directly published with the specified 
// fields. The lower rules are not evaluated further for that user.
// on the client you must subscribe all publish rules.

var publicUserFields = {
  "profile.picture": true,
  "profile.name": true,
  "profile.location": true,
  "profile.homepage": true,
  "profile.company": true,
  "profile.companyUrl": true,
  "profile.hacking": true,
  "profile.available": true,
  "profile.social": true,
  "profile.skills": true,
  "profile.favoriteSkills": true

  // DON'T INCLUDE
  // "profile.socialPicture": true,
};

var publicUserFieldsEmail = _.extend(_.clone(publicUserFields), {
  "profile.email": true
});

var publicUserFieldsCurrentUser = _.extend(_.clone(publicUserFieldsEmail), {
  "emails": true,
  "profile.socialPicture": true
});


// 1. current logged in user
// publish all data in the 'emails' and 'profile' fields for the current user
Meteor.publish("publicUserDataCurrentUser", function () {
  if(!this.userId) return null;
  var selector = {_id: this.userId};
  return Meteor.users.find(selector, {fields: publicUserFieldsCurrentUser}); 
});

// 2. users with public e-mailaddress
// we make emailaddresses public of the users that are available for drink/lunch
// publish their public information including emailaddress
Meteor.publish("publicUserDataEmail", function () {
  if(!this.userId) return null;
  var selector = {"profile.available": {$exists: true, $not: {$size: 0}}};
  return Meteor.users.find(selector, {fields: publicUserFieldsEmail}); 
});

// 3. otherwise only the default public user data is published
// publish all public profile data of all users
Meteor.publish("publicUserData", function () {
  if(!this.userId) return null;
  return Meteor.users.find({}, {fields: publicUserFields}); 
});


