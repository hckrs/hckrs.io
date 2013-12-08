/* 
  ADMIN functionality 
  
  In this file we define functions that can only be runned by Admins.
  You call this methods from the Browser Console by typing the command:

  Meteor.call("METHOD_NAME");

  Replace METHOD_NAME by the corresponding name of the function you would call.
  When the function need some parameter you can do the method call this way:

  Meteor.call("METHOD_NAME", param1, param2);

  When the server method return a result you can catch it by a callback function:

  Meteor.call("METHOD_NAME", function(error, result) {
    // do something with the result here...
  });  

*/


Meteor.startup(function() {
  Meteor.methods({
    'addInvites': addInvites,
    'addInvitesToCity': addInvitesToCity,   
    'addInvitesToUser': addInvitesToUser
  });
});



// @param number Number [optional, default=1] (number of invites)
var addInvites = function(number) {
  verifyAdmin();

  var number = number || 1;
  check(number, Number);
  
  Meteor.users.find().forEach(function(user) {
    addInvitesToUser(user._id, number);
  });
}

// @param city String (name of the city where users receive invites)
// @param number Number [optional, default=1] (number of invites)
var addInvitesToCity = function(city, number) {
  verifyAdmin();

  var number = number || 1;
  check(city, String);
  check(number, Number);
  
  Meteor.users.find({city: city}).forEach(function(user) {
    addInvitesToUser(user._id, number);
  });
}

// @param userId String (userId that receive a new invite)
// @param number Number [optional, default=1] (number of invites)
var addInvitesToUser = function(userId, number) {
  verifyAdmin();

  var number = number || 1;
  check(userId, String);
  check(number, Number);


  var user = Meteor.users.findOne(userId);

  // check if user exists
  if (!user)
    throw new Meteor.Error(500, "User doesn't exists");

  if (number < 1)
    throw new Meteor.Error(500, "No valid number of invitations");

  // calculate new number of invitations
  var maxInvites = Meteor.settings.maximumNumberOfUnusedInvitesPerUser || 999;
  var newNumberOfInvites = Math.min(user.invitations + number, maxInvites);

  // add invitations to this user
  Meteor.users.update(userId, {$set: {invitations: newNumberOfInvites}});
}








// helper functions

// check if the logged in user is an admin
var verifyAdmin = function() {
  if (!Meteor.user() || !Meteor.user().isAdmin)
    throw new Meteor.Error(500, 'No admin privilege');
}