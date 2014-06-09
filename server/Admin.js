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
    'inviteUserByToon': inviteUserByToon,
    'inviteUserByUser': inviteUserByUser,
    'inviteUser': inviteUser,
  });
});



var inviteUser = function(userId) {
  verifyAdmin();

  forceInvitationOfUser(userId);
}

var inviteUserByToon = function(userId) {
  verifyAdmin();

  var broadcastUser = Meteor.users.findOne({globalRank: 1})
  var broadcastUserId = broadcastUser && broadcastUser._id;
  inviteUserByUser(userId, broadcastUserId);
}

var inviteUserByUser = function(userId, broardcastUserId) {
  verifyAdmin();

  var broardcastUser = Meteor.users.findOne(broardcastUserId);
  var phrase = broardcastUser && broardcastUser.invitationPhrase;
  
  if (!phrase || !Match.test(phrase, Number))
    throw new Meteor.Error(500, "invalid phrase");
  
  verifyInvitationOfUser(phrase, userId);
}





// helper functions

// check if the logged in user is an admin
var verifyAdmin = function() {
  if (!Meteor.user() || !Meteor.user().isAdmin)
    throw new Meteor.Error(500, 'No admin privilege');
}