UserData = {};


// fetching additional user information from the service
// and attach it to the service object.
// then a new user profile is created by filling in the gaps.

// @param user {Object} (an user object)
// @param service String (facebook, github, twitter, etc.)
// @return {Object} (the same user object with additional info attached to it)
UserData.extendUserByFetchingService = function(user, service) {
  
  // fetch additional user data from service
  var serviceData = ServiceData.fetchUserData(user, service);

  // attach the new service data directly
  user.services[service] = _.extend(user.services[service], serviceData);

  // transform service data in uniform format
  var userData = ServiceData.unify(serviceData, service);

  // extending the user's profile
  user = extendUserProfile(user, userData, service);
  
  return user;
}



// merge two user objects
// merge the second user in the first one, returning a copy of the result
// notice that some properties must be handled manually
UserData.mergeUserData = function(firstUser, secondUser) {

  // merge 2 objects (copy right properties to left, it will override always)
  var mergedData = _.deepExtend(_.deepClone(secondUser), _.deepClone(firstUser)); 

  // XXX arrays are considered as sets when working with primitives.
  // but objects in arrays are compared on their pointer (no deep equality testing)

  // remove duplicate emails
  mergedData.emails = Util.uniqFilter(mergedData.emails);

  // properties that must take the highest value of the two users
  // this is required for some Boolean / Number types.
  mergedData.invitations = Math.max(firstUser.invitations, secondUser.invitations) || firstUser.invitations || secondUser.invitations || 0;
  
  if (!_.isUndefined(mergedData.isAccessDenied))
    mergedData.isAccessDenied = !!(firstUser.isAccessDenied && secondUser.isAccessDenied);

  if (!_.isUndefined(mergedData.isIncompleteProfile))
    mergedData.isIncompleteProfile = !!(firstUser.isIncompleteProfile && secondUser.isIncompleteProfile);
  
  if (!_.isUndefined(mergedData.isUninvited))
    mergedData.isUninvited = !!(firstUser.isUninvited && secondUser.isUninvited);

  if (!_.isUndefined(mergedData.isHidden))
    mergedData.isHidden = !!(firstUser.isHidden && secondUser.isHidden);  

  if (!_.isUndefined(mergedData.isAdmin))
    mergedData.isAdmin = !!(firstUser.isAdmin || secondUser.isAdmin);

  if (!_.isUndefined(mergedData.isAmbassador))
    mergedData.isAmbassador = !!(firstUser.isAmbassador || secondUser.isAmbassador);

  return mergedData;
}





// find an existing user that matches the idenity of the given user data
// probably this is the same user and we can merge the accounts afterwards
UserData.findExistingUser = function(userData) {

  // we matching on emailaddresses
  var emails = userData.emails ? _.pluck(userData.emails, 'address') : [];
  var existingUser = Meteor.users.findOne({
    '_id': {$ne: userData._id}, 
    'emails.address': {$in: emails}
  });

  if (!existingUser)
    return false;
  
  // if one of the matched e-mails isn't verified
  // we can not merge the user
  // also meteor don't allow to create users with the same e-mail
  // so this request can't be handled and we throw a error
  var unverifiedEmails = _.pluck(_.where(existingUser.emails, {verified: false}), 'address');
  if (_.some(unverifiedEmails, function(e) { return _.contains(emails, e); }))
    throw new Meteor.Error(500, 'duplicateEmail');

  return existingUser;
}


// Existing users can link additional social services to their accounts.
// Therefor a service token is required to fetch user data from the external service. 
// This token can obtained on the client-side when the user authenticate the service.
// After the token is obtained, the server method below can be called and it will fetch 
// user information from the external service and update user's profile.

// @param token String (oauth requestToken that can be exchanged for an accessToken)
// @param service String (facebook, github, twitter, etc.)
// @effect (updating the user object with an additional service attached)
var _lastUsedToken;
UserData.addServiceToCurrentUser = function(token, secret, service) {
  check(token, String);
  check(secret, String);
  check(service, String);

  var userId = this.userId; //current logged in user
  var user = Meteor.users.findOne(userId); //get user document from our collection
  var Service = global[Util.capitaliseFirstLetter(service)]; //meteor package for this external service

  // create an extended user with the servicedata attached
  var extendedUser = _.clone(user);


  // XXX Meteor issue, this method is called a second time 
  // when we change the current logged in user below with this.setUserId()
  // we must prevent from running again and not throwing errors
  if (_lastUsedToken === token) 
    return;
  else _lastUsedToken = token; 


  if (!userId || !user)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (!token)
    throw new Meteor.Error(500, "Unknow token: " + token);

  if (!Service)
    throw new Meteor.Error(500, "Unknow service: " + service);

  // retrieve user data from the external service
  var serviceResponse = Service.retrieveCredential(token, secret);
  var serviceData = serviceResponse && serviceResponse.serviceData;

  if(!serviceData)
    throw new Meteor.Error(500, "Unknow service data: " + serviceData);

  // extend the user with the service data
  extendedUser.services[service] = serviceData;

  // fetch additional user information
  // merge fetched data into the user object
  extendedUser = UserData.extendUserByFetchingService(extendedUser, service);

  // after replacing the previous service data
  // some e-mailaddress can be become unused, clean them
  Meteor.setTimeout(_.partial(Account.cleanEmailAddress, userId), 10000);


  // check if the requested external account is already assigned to an other user account
  var existingUser1 = Meteor.users.findOne(_.object([
    ["services."+service+".id", serviceData.id], 
    ['_id', {$ne: userId}]
  ]));

  // check if there is an other user with the same email -> merge
  var existingUser2 = UserData.findExistingUser(extendedUser);
  

  
    
  if (existingUser1) {

    // service data already present in an other user account
    // merge 2 accounts
    var mergedUser = mergeUsers.call(this, user, existingUser1);

  } else if (existingUser2) {

    // there is an account that uses the same emailadress
    // merge with that account AND include the new service data
    // merge 2 accounts
    var mergedUser = mergeUsers.call(this, extendedUser, existingUser2);    

  } else {

    // only add the new service data to this user
    Meteor.users.update(userId, extendedUser, {validate: false});

  }
}


// Remove a external service from user's account
// this will not remove the actual service data
// because that is required to identify the user, so we
// only remove the social service link in user's profile
UserData.removeServiceFromCurrentUser = function(service) {
  check(service, String);

  var userId = this.userId; //current logged in user
  var user = Meteor.users.findOne(userId); //get user document from our collection

  if (!userId || !user)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (!user.services[service])
    throw new Meteor.Error(500, "Service isn't linked to : " + userId);     

  // create modifiers
  var unsetModifier = _.object([
    //["services."+service, true], // DON'T DELETE SERVICE DATA (it create ghost accounts)
    ["profile.social."+service, true], // only delete the link to user's social profile
    // ["profile.socialPicture."+service, true] // don't delete the profile picture
  ]);

  // remove service data
  Meteor.users.update(userId, {$unset: unsetModifier}); 
}



// update profile picture
UserData.updateServiceProfilePicture = function(userId, serviceName) {
  try {
    var user = Users.findOne(userId);
    var extendedUser = UserData.extendUserByFetchingService(user, serviceName);
    return extendedUser.profile.socialPicture[serviceName];
  } catch(e) {
    return;
  }
}



/* Private */


// extending the user's profile with the given data
// the given data must be in uniform format
var extendUserProfile = function(user, userData, service) {
  
  // data used for creating the user profile
  var extract = ['name', 'email', 'company', 'homepage', 'location' /*, 'gender', 'birthday'*/];
  var data = _.pick(userData, extract);
  
  // fill undefined or null properties in user's profile with the new user data
  user.profile = _.defaults(Util.omitNull(user.profile), data); 
 
  // default required properties
  if (!user.profile.social) 
    user.profile.social = {};

  if (!user.profile.socialPicture) 
    user.profile.socialPicture = {};
  
  // customized profile properties
  if (userData.link) 
    user.profile.social[service] = userData.link;

  if (userData.picture) {
    var isCurrentPicture = user.profile.picture === user.profile.socialPicture[service];
    user.profile.socialPicture[service] = userData.picture;
    if (!user.profile.picture || isCurrentPicture) 
      user.profile.picture = userData.picture;
  }

  // add e-mail address to user's account
  if (userData.email) {
    if (!user.emails) user.emails = [];
    if (!_.findWhere(user.emails, {address: userData.email}))
      user.emails.push({ address: userData.email, verified: true });
  }

  return user;
}

// merge two user accounts by puting data of the newest user
// into the oldest. Afterwards login into the (new) account.
// this function must be called within the method-call scope
// so we can call the function this.setUserId()
var mergeUsers = function(user, existingUser) {

  // check which account is the oldest
  var currentIsNewer = existingUser.createdAt.getTime() < user.createdAt.getTime();
  var surviveUser = currentIsNewer ? existingUser : user; // oldest account (will be survive)
  var zombieUser = currentIsNewer ? user : existingUser; // newest account (will be removed)

  // login the merged user (probably the same as currect session)
  this.setUserId(surviveUser._id); 

  // merge the user data into the oldest user
  var mergedUserData = UserData.mergeUserData(surviveUser, zombieUser);
  removeUser(zombieUser._id);
  Meteor.users.update(zombieUser._id, {$set: {mergedWith: surviveUser._id}});
  Meteor.users.update(surviveUser._id, mergedUserData, {validate: false});

  // replace all userID references in other collections
  Invitations.update({broadcastUser: zombieUser._id}, {$set: {broadcastUser: surviveUser._id}}, {multi: true});
  Invitations.update({receivingUser: zombieUser._id}, {$set: {receivingUser: surviveUser._id}}, {multi: true});
  Meteor.users.update({mergedWith: zombieUser._id}, {$set: {mergedWith: surviveUser._id}}, {multi: true});

  return surviveUser;
}


// Remove an account
// this is be done be marking an account as deleted rather than deleting permanently
var removeUser = function(userId) {
  Meteor.users.update(userId, {$set: {'isHidden': true, 'isDeleted': true, 'deletedAt': new Date(), 'emails': [], 'services': {}}});
  Meteor.users.update(userId, {$set: {'services.resume.loginTokens': []}});
}

