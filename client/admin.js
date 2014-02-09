
Admin = {};

Admin.inviteUser = function(userId) {
  check(userId, String);

  return serverCall('inviteUser', userId);
}

Admin.inviteUserByToon = function(userId) {
  check(userId, String);

  return serverCall('inviteUserByToon', userId);
}

Admin.inviteUserByUser = function(userId, broadcastUserId) {
  check(userId, String);
  check(broadcastUserId, String);

  return serverCall('inviteUserByUser', userId, broadcastUserId);
}




// helpers

var serverCall = function() {
  var args = _.toArray(arguments);
  args.push(logSuccess); 
  Meteor.call.apply(this, args);
  return "Called '"+args[0]+"'";
}

var logSuccess = function(err, res) {
  if (err) {
    console.log("ERROR", err);
  } else {
    console.log("SUCCESS");
    console.log(res)
  }
}