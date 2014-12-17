Account = {};


// Remove e-mailaddress from user's account that aren't in use
// This is the case when it is not used by a social services
// or manually filled in in the user's profile
Account.cleanEmailAddress = function(userId) { 
  var user = Meteor.users.findOne(userId);
  
  var usedEmails = _.map(user.services, function(s) { return s.email; });
  usedEmails.push(user.profile.email);
  usedEmails = _.compact(usedEmails);
  
  // remove emails that arn't in use
  Meteor.users.update(userId, {$pull: {'emails': {'address': {$nin: usedEmails}}}});
}


Account.updateProfilePictures = function() {
  
  var users = Users.find({}, {fields: {
    "profile.socialPicture": 1, 
    "profile.picture": 1, 
    "profile.name": 1,
  }}).fetch();

  // update twitter images if needed
  async.forEachLimit(users, 4, function(user, cb) {

    var serviceName = "twitter";
    var image = user.profile.socialPicture[serviceName];
    var isCurrentPicture = image === user.profile.picture;
    
    if (!image) 
      return cb(); // go to next user

    var update = function() {

        // get new picture
        var picture = UserData.updateServiceProfilePicture(user._id, serviceName);

        if (!picture) 
          return;
        
        // update user's picture
        var modifier = {};
        modifier["profile.socialPicture."+serviceName] = picture;
        if (isCurrentPicture)
          modifier["profile.picture"] = picture; // also change current picture
        Users.update(user._id, {$set: modifier});  
        
        // log
        console.log("Update "+serviceName+" profile picture of user " + user.profile.name);
    }

    // check if image exists, if not exists it means 
    // that image has changed and we have to update!
    HTTP.get(image, function(err){ 
      if (err && err.response && err.response.statusCode === 404) 
        update(); // update required
      cb(); // go to next user
    });  

  });

}


// when this function is called, is must already be verified that 
// the user is allowed to do this operation
// (also called from Admin.js)
Account.verifyInvitationOfUser = function(phrase, userId) { 
  check(phrase, Number);
  check(userId, String);

  // search broadcast user
  var broadcastUser = Meteor.users.findOne({invitationPhrase: phrase});
  if (broadcastUser.mergedWith)
    broadcastUser = Meteor.users.findOne(broadcastUser.mergedWith);

  // receiving user
  var receivingUser = Meteor.users.findOne(userId);

  // search for previous invitations
  var alreadyInvited = !!Invitations.findOne({receivingUser: userId});

  if (!receivingUser)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (alreadyInvited)
    throw new Meteor.Error(500, "User is already invited.");

  if (!broadcastUser)
    throw new Meteor.Error(500, "Unknow broadcast user");

  if (broadcastUser._id === receivingUser._id)
    throw new Meteor.Error(500, "Can't invite yourself");

  if (broadcastUser.invitations < 1)
    throw new Meteor.Error(200, "limit", "Invitation limit reached.");
  
  // invitation valid

  // insert invitation couple in database
  Invitations.insert({
    broadcastUser: broadcastUser._id,
    receivingUser: userId
  });  

  // decrement broadcast user's unused invitations
  Meteor.users.update(broadcastUser._id, {$inc: {invitations: -1}});

  // mark as invited
  Account.forceInvitationOfUser(receivingUser._id);
}

// when this function is called, is must already be verified that 
// the user is allowed to do this operation
// (also called from Admin.js)
Account.forceInvitationOfUser = function(userId) {
  check(userId, String);

  // receiving user
  if (!Meteor.users.findOne(userId))
    throw new Meteor.Error(500, "Unknow user: " + userId);

  // mark as invited
  Meteor.users.update(userId, {$unset: {isUninvited: true}});

  // check if user now get access to the website
  Account.requestAccessOfUser(userId); 
}




// when this function is called, is must already be verified that 
// the user is allowed to do this operation
Account.requestAccessOfUser = function(userId) { 
  var user = Meteor.users.findOne(userId);

  if (!user)
    throw new Meteor.Error(500, "Unknow user");

  if (!user.city) 
    throw new Meteor.Error(500, "User isn't attached to some city.");    

  if (user.isUninvited)
    throw new Meteor.Error(500, "notInvited", "User hasn't used an invitation code.");

  if (user.isIncompleteProfile)
    throw new Meteor.Error(500, "profileIncomplete", "User profile is incomplete.");

  if (!_.findWhere(user.emails, {address: user.profile.email, verified: true}))
    throw new Meteor.Error(500, "emailNotVerified", "e-mailaddress isn't verified.");

  // access allowed!

  // execute these commands if user had previously no access
  if (user.isAccessDenied === true) {
    
    // set signup date
    if (!user.accessAt)
      Meteor.users.update(userId, {$set: {accessAt: new Date()}});
  }

  // allow access for this user
  Meteor.users.update(userId, {$unset: {isAccessDenied: true}});

  // request visibility
  requestVisibilityOfUser(userId);
}



// move user to new city
// Users can move thereself to another city when they are not fullu registered.
// that means they have the flag 'isAccessDenied'. 
// Otherwise you must have ambassador persmissions.
Account.moveUserToCity = function(hackerId, city) { // called from Methods.js
  var hacker = Users.findOne(hackerId);
  
  if (!hacker)
    throw new Meteor.Error(500, "no such user");  

  if (!_.contains(CITYKEYS, city))
    throw new Meteor.Error(500, "no valid city");  

  // check permissions
  var userId = this.userId || Meteor.userId();
  var me = userId === hackerId;
  var ambPerm = Users.hasAmbassadorPermission(userId, hacker.city);
  
  if (!me && !ambPerm)
    throw new Meteor.Error(500, 'not allowed');

  if (!hacker.isAccessDenied && me) {
    if (ambPerm) 
      throw new Meteor.Error(500, "can't move yourself");  
    else 
      throw new Meteor.Error(500, "cite move not allowed", 'already registered at some city');  
  }


  // update user's city
  Users.update(hackerId, {$set: {
    city: city,
    currentCity: city
  }});

  // automatic invite the first n users, and give them more invites
  if (Users.find({city: city}).count() <= Settings['firstNumberOfUsersAutoInvited']) {
    Users.update(hackerId, {$set: {invitations: Settings['defaultNumberOfInvitesForAutoInvitedUsers']}});
    try { Account.forceInvitationOfUser(hackerId); } catch(e) {};
  }

  // let ambassadors/admins know that a new user has registered the site
  Email.sendOnNewUser(hackerId);
}




/* private */



// when user created an account he hasn't directly full access
// the client can call this function to verify the invitation phrase
// so we can permit access for this user
var verifyInvitation = function(phrase) {
  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user.");

  Account.verifyInvitationOfUser(phrase, Meteor.userId());
}

// user let us know that he is ready filling in his profile
// check if all required properties are filled in
var requestProfileCompleted = function() {

  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user");

  if (!Meteor.user().profile.email || !Meteor.user().profile.name)
    throw new Meteor.Error(500, "profileIncomplete", "User profile is incomplete.");

  // make user visible to other users
  Meteor.users.update(Meteor.userId(), {$unset: {isIncompleteProfile: true}});

  // request access for this user
  requestAccess();
}


// request allow access for a user
// user will be allowed to access the site if he is invited
// and his profile is complete
// and has filled in a valid e-mailaddress
var requestAccess = function() {
  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user.");

  Account.requestAccessOfUser(Meteor.userId());
}

// make a user visible for others
// by default a user is hidden at time of signup 
// until he is allowed to access the site.
// also admins are hidden
var requestVisibility = function() {
  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user.");

  requestVisibilityOfUser(Meteor.userId());
}

// when this function is called, is must already be verified that 
// the user is allowed to do this operation
var requestVisibilityOfUser = function(userId) {
  var user = Meteor.users.findOne(userId);

  if (!user)
    throw new Meteor.Error(500, "Unknow user");

  // user must have allow access to become visible
  if (user.isAccessDenied == true)
    throw new Meteor.Error(500, "User don't allowed to be visible");

  // make user visible to other users
  Meteor.users.update(userId, {$unset: {isHidden: true}});
}


// When user have manually entered e-mail address he must verify it.
// Admins can force to skip this process
var forceEmailVerification = function(userId) {
  var user = Users.findOne(userId);
  var emails = _.pluck(user.emails, 'address');

  if (!Users.hasAmbassadorPermission())
    throw new Meteor.Error(500, "No permissions");
  if (!user)
    throw new Meteor.Error(500, "User doesn't exists");
  if (!_.contains(emails, user.profile.email))
    throw new Meteor.Error(500, "E-mail not registered", "E-mail address not present in user's list of addresses.")
  if (_.findWhere(user.emails, {address: user.profile.email, verified: true}))
    throw new Meteor.Error(500, "E-mail already verified")    

  // force verification
  Users.update({_id: userId, "emails.address": user.profile.email}, {$set: {"emails.$.verified": true}});

  // request access of user
  Account.requestAccessOfUser(userId);
}

// Resend verification email
var sendVerificationEmail = function(userId) {
  var user = Users.findOne(userId);

  if (!Users.hasAmbassadorPermission())
    throw new Meteor.Error(500, "No permissions");
  if (!user)
    throw new Meteor.Error(500, "User doesn't exists");

  Accounts.sendVerificationEmail(userId, user.profile.email);
}





// define methods that can be called from the client-side
Meteor.methods({
  "addServiceToUser": UserData.addServiceToCurrentUser,
  "removeServiceFromUser": UserData.removeServiceFromCurrentUser,
  "moveUserToCity": Account.moveUserToCity,
  "requestAccess": requestAccess,
  "requestProfileCompleted": requestProfileCompleted,
  "verifyInvitation": verifyInvitation,
  "forceEmailVerification": forceEmailVerification,
  "sendVerificationEmail": sendVerificationEmail,
});



