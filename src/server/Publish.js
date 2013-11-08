

Meteor.publish("userData", function () {
  // publish all user data to the client
  // XXX TODO: only the public information must be published (SECURITY ISSUE!!!)
  return Meteor.users.find({}); 

});