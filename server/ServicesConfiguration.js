

// Register external services
// that can be used for user account creation and login.
// This will be done once, at the first time you run meteor.

// check which services are already configured
var facebookConfigured = Accounts.loginServiceConfiguration.findOne({service: 'facebook'});
var githubConfigured = Accounts.loginServiceConfiguration.findOne({service: 'github'});
var twitterConfigured = Accounts.loginServiceConfiguration.findOne({service: 'twitter'});


Meteor.startup(function() {

  // register facebook
  if(!facebookConfigured && Meteor.settings.facebook) {
    Accounts.loginServiceConfiguration.insert({
      service: "facebook",
      appId: Meteor.settings.facebook.appId,
      secret: Meteor.settings.facebook.secret
    });
  }

  // register github app
  if(!githubConfigured && Meteor.settings.github) {
    Accounts.loginServiceConfiguration.insert({
      service: "github",
      clientId: Meteor.settings.github.clientId,
      secret: Meteor.settings.github.secret
    });
  }

  // register twitter app
  if(!twitterConfigured && Meteor.settings.twitter) {
    Accounts.loginServiceConfiguration.insert({
      service: "twitter",
      consumerKey: Meteor.settings.twitter.consumerKey,
      secret: Meteor.settings.twitter.secret
    });
  }
  
});


// Manually creating OAuth requests to the external services.
// In this manner you can obtain all information about a user
// Don't forget to set requestPermission that the user must accept.

// @param user String|{Object} (either a userId or an user object)
// @param service String (facebook, github, twitter, etc.)
// @param method String (GET, POST, etc.)
// @param url String (url of the resource you request)
// @param params {Object} (data send with the request)
var oauthCall = function(user, service, method, url, params) {  
  var config = Accounts.loginServiceConfiguration.findOne({service: service});

  if (!config)
    throw new Meteor.Error(500, "Service unknow: " + service);

  if (_.isString(user))
    user = Meteor.users.findOne(user);

  if (!user)
    throw new Meteor.Error(500, "User unknow");

  if (!user.services[service] || !user.services[service].accessToken)
    throw new Meteor.Error(500, "User not (yet) authenticated for this service.");

  var oauth = new OAuth1Binding(config);
  oauth.accessToken = user.services[service].accessToken;
  oauth.accessTokenSecret = user.services[service].accessTokenSecret;

  params = _.extend(params || {}, {oauth_token: oauth.accessToken});
      
  var headers = oauth._buildHeader(params);

  return oauth._call(method, url, headers, params);
}




// fetch user information from external service
// we try to make user's profile complete, if the service don't provide 
// the basic information we set the value to null

// @param user String|{Object} (either a userId or an user object)
// @param service String (facebook, github, twitter, etc.)
var fetchServiceUserData = function(user, service) {

  var services = {
  
    "github": function(user) {
      var data = HTTP.get("https://api.github.com/user", {
        headers: {"User-Agent": "Meteor/"+Meteor.release},
        params: {access_token: user.services[service].accessToken}
      }).data;

      var userData = {
        'id': data.id,
        'username': data.login,
        'email': data.email,
        'name': data.name,
        //'gender': null,
        //'birthday': null,
        'city': data.location,
        'link': data.html_url,
        'picture': data.avatar_url && data.avatar_url + "&size=180",
        'lang': null
      };

      return userData;
    },
    
    "facebook": function(user) {
      var url = "https://graph.facebook.com/me";
      var params = { fields: [ 'id', 'email', 'name', 'locale', 'picture', 
                               'link', 'username', 'location' /*, 'birthday', 'gender' */ ] };
      var data = oauthCall(user, 'facebook', 'GET', url, params).data;

      // if (data.birthday) {
      //   var p = data.birthday.split('/');
      //   data.birthday = new Date(p[2], p[0], p[1]);
      // }

      if (data.username && data.picture && data.picture.data && !data.picture.data.is_silhouette)
        data.picture = "https://graph.facebook.com/" + data.username + "/picture?type=large";
      
      var userData = {
        'id': data.id,
        'username': data.username,
        'email': data.email,
        'name': data.name,
        //'gender': data.gender,
        //'birthday': data.birthday,
        'city': data.location && data.location.name, //XXX TODO: use additional data.location.id 
        'link': data.link,
        'picture': data.picture,
        'lang': data.locale && data.locale.substr(0,2)
      };

      return userData;
    },
    
    "twitter": function(user) {
      var url = "https://api.twitter.com/1.1/account/verify_credentials.json";
      var data = oauthCall(user, 'twitter', 'GET', url).data;

      if (!data.default_profile_image && data.profile_image_url)
        data.picture = data.profile_image_url.replace(/_normal(.{0,5})$/, '$1');

      var userData = {
        'id': data.id_str,
        'username': data.screen_name,
        'email': null,
        'name': data.name,
        //'gender': null,
        //'birthday': null,
        'city': data.location,
        'link': data.screen_name && "http://twitter.com/" + data.screen_name,
        'picture': data.picture,
        'lang': data.lang
      };

      return userData;
    }
  }

  if (!services[service])
    throw new Meteor.Error(500, "Unknow how to fetch user data from " + service);    

  // return the fetched data
  return omitNull( services[service](user) );
}




// merge new user data in the given user object
// only empty fields are filled in, so no info will be overidden

// @param user {Object} (an user object)
// @param service String (facebook, github, twitter, etc.)
// @param userData {Object} (the additional user data that fill the empty properties)
// @return {Object} (the same user object with additional info attached to it)
var mergeServiceUserData = function(user, service, userData) {
  
  // data used for creating the user profile
  var extract = ['name', 'city', 'lang', 'email' /*, 'gender', 'birthday'*/];
  var data = _.pick(userData, extract);

  // fill undefined or null properties in user's profile with the new user data
  user.profile = _.defaults(omitNull(user.profile), omitNull(data)); 

  // default required properties
  if (!user.profile.social) 
    user.profile.social = {};

  if (!user.profile.socialPicture) 
    user.profile.socialPicture = {};
  
  // customized profile properties
  if (userData.link) 
    user.profile.social[service] = userData.link;

  if (userData.picture) {
    user.profile.socialPicture[service] = userData.picture;
    if (!user.profile.picture) 
      user.profile.picture = userData.picture;
  }

  // add e-mail address to user's account
  if (userData.email) {
    if (!user.emails) user.emails = [];
    if (!_.findWhere(user.emails, {address: userData.email}))
      user.emails.push({ address: userData.email, verified: true });
  }

  // beside creating a new profile for this user, 
  // the user also gets a new service data object
  user.services[service] = _.extend(user.services[service], userData);
  
  return user;
}



// merge user accounts by combining two user objects
// merge the second user in the first one, returning a copy of the result
// notice that some properties must be handled manually
var mergeUsers = function(firstUser, secondUser) {
  
  // merge 2 objects (taking right object and extend it with the first one)
  var mergedData = _.deepExtend(_.deepClone(secondUser), _.deepClone(firstUser)); 

  // XXX arrays are considered as sets when working with primitives.
  // but objects in arrays are compared on their pointer (no deep equality testing)

  // remove duplicate emails
  mergedData.emails = _.uniq(mergedData.emails, _.isEqual);

  // manually handle properties
  if (firstUser.isInvited || secondUser.isInvited)
    mergedData.isInvited = true;
  if (firstUser.allowAccess || secondUser.allowAccess)
    mergedData.allowAccess = true;
  if (firstUser.isAdmin || secondUser.isAdmin)
    mergedData.isAdmin = true;

  return mergedData;
}



// find an existing user that matches the idenity of the given user data
// probably this is the same user and we can merge the accounts afterwards
var findExistingUser = function(userData) {

  // now we matching on verified emailaddresses only
  var emails = userData.emails ? _.pluck(userData.emails, 'address') : [];
  var emailQuery = {$elemMatch: {address: {$in: emails}, verified: true}};
  var existingUser = Meteor.users.findOne({'emails': emailQuery});

  return existingUser;
}


// When an user account is created (after user is logging in for the first time)
// extract the important user information and return a new user object where this
// information is associated in user's profile.
// XXX TODO: also update user's profile when user logged in in the future.

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile;

  // determine which external service is used for account creation
  var serviceName = _.first(_.keys(_.omit(user.services, ['resume'])));

  // fetch additional user information
  var userData = fetchServiceUserData(user, serviceName);

  // extend user object with additional fetched user information
  var user = mergeServiceUserData(user, serviceName, userData);

  // find an existing user that probaly match this identity
  var existingUser = findExistingUser(user);  

  // merge data from existing user if exists
  if (existingUser) {

    user = mergeUsers(existingUser, user);
    Meteor.users.remove(existingUser._id);

  }
    
  // additional information, for new user only!
  if (!existingUser) {
  
    // no invite required for the first registered user
    if (Meteor.users.find().count() === 0)
      user.isInvited = true;

    // set the city where this user becomes registered
    user.city = "lyon";

    // determine and set the hacker ranking
    var local = Meteor.users.findOne({city: user.city}, {sort: {localRank: -1}});
    var global = Meteor.users.findOne({}, {sort: {globalRank: -1}});
    user.localRank = (local && local.localRank || 0) + 1;
    user.globalRank = (global && global.globalRank || 0) + 1;

    // give this user the default number of invite codes
    var numberOfInvites = Meteor.settings.defaultNumberOfInvitesForNewUsers || 0;
    _.times(numberOfInvites, _.partial(createInviteForUser, user._id));
  }
  
  // create new user account
  return user; 
});


// Remove an account
// this is be done be marking an account as deleted rather than deleting permanently
// you can set additional properties that are setted on this archived user object
var removeUser = function(userId, additionalProperties) {
  Meteor.users.update(userId, {$set: {'isDeleted': true, 'deletedAt': new Date(), 'emails': [], 'services': {}}});
  Meteor.users.update(userId, {$set: {'services.resume.loginTokens': []}});
  if (additionalProperties) 
    Meteor.users.update(userId, {$set: additionalProperties});
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
var addServiceToCurrentUser = function(token, service) {
  check(token, String);
  check(service, String);

  var userId = this.userId; //current logged in user
  var user = Meteor.users.findOne(userId); //get user document from our collection
  var Service = global[capitaliseFirstLetter(service)]; //meteor package for this external service

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
  var serviceResponse = Service.retrieveCredential(token);
  var serviceData = serviceResponse && serviceResponse.serviceData;

  if(!serviceData)
    throw new Meteor.Error(500, "Unknow service data: " + serviceData);

  // extend the user with the service data
  extendedUser.services[service] = serviceData;

  // fetch additional user information
  var userData = fetchServiceUserData(extendedUser, service);
  
  // merge fetched data into the user object
  extendedUser = mergeServiceUserData(extendedUser, service, userData);


  // check if the requested external account is already assigned to an other user account
  var existingUser1 = Meteor.users.findOne(_.object([
    ["services."+service+".id", serviceData.id], 
    ['_id', {$ne: userId}]
  ]));

  // check if there is an other user with the same email -> merge
  var existingUser2 = findExistingUser(extendedUser);
  


  // helper function for merging two user accounts
  var merge = function(user, existingUser) {

    // check which account is the oldest
    var currentIsNewer = existingUser.createdAt.getTime() < user.createdAt.getTime();
    var oldestUser = currentIsNewer ? existingUser : user;
    var newestUser = currentIsNewer ? user : existingUser;

    // login the merged user (probably the same as currect session)
    this.setUserId(oldestUser._id); 

    // merge the user data into the oldest user
    var mergedUserData = mergeUsers(oldestUser, newestUser);
    removeUser(newestUser._id, {mergedWith: oldestUser._id});
    Meteor.users.update(oldestUser._id, mergedUserData);

    return oldestUser;
  }

  
    
  if (existingUser1) {

    // service data already present in an other user account
    // merge 2 accounts
    var mergedUser = merge.call(this, user, existingUser1);

  } else if (existingUser2) {

    // there is an account that uses the same emailadress
    // merge with that account AND include the new service data
    // merge 2 accounts
    var mergedUser = merge.call(this, extendedUser, existingUser2);    

  } else {

    // only add the new service data to this user
    Meteor.users.update(userId, extendedUser);

  }
}


// Remove a external service from user's account
// this will not remove the actual service data
// because that is required to identify the user, so we
// only remove the social service link in user's profile
var removeServiceFromCurrentUser = function(service) {
  check(service, String);

  var userId = this.userId; //current logged in user
  var user = Meteor.users.findOne(userId); //get user document from our collection

  if (!userId || !user)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (!user.services[service])
    throw new Meteor.Error(500, "Service isn't linked to : " + userId);     

  // if this service profile picture is setted as default, choose another one
  var otherPictures = _.values(_.omit(user.profile.socialPicture, service));
  if (!_.contains(otherPictures, user.profile.picture))
    Meteor.users.update(userId, {$set: {"profile.picture": _.first(otherPictures)}});

  // create modifiers
  var unsetModifier = _.object([
    //["services."+service, true], // DON'T DELETE SERVICE DATA (it create ghost accounts)
    ["profile.social."+service, true],
    ["profile.socialPicture."+service, true]
  ]);

  // remove service data
  Meteor.users.update(userId, {$unset: unsetModifier}); 
}




// when user created an account he hasn't directly full access
// the client can call this function to verify an invitation code
// so we can permit access for this user
var verifyInvitationCode = function(code) {
  check(code, String);
  
  // search invitation
  var invitation = Invitations.findOne({code: code});

  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user: " + this.userId);

  if (Meteor.user().isInvited)
    throw new Meteor.Error(500, "User is already invited.");

  if (!invitation)
    throw new Meteor.Error(500, "Unknow invitation");

  if (invitation.used)
    throw new Meteor.Error(500, "Invitation already used");

  // code is valid!
  
  // assign invitation to current user
  var modifier = { receivingUser: Meteor.userId(), signedupAt: new Date(), used: true };
  Invitations.update(invitation._id, {$set: modifier});  

  // mark user as invited
  Meteor.users.update(Meteor.userId(), {$set: {isInvited: true}});

  // check if user now get access to the website
  requestAccess(); 
}


// generate a new invitation code for a user
// that the user can give to someone else
createInviteForUser = function (userId) { // GLOBAL (also called from Admin.js)

  // insert invitation
  Invitations.insert({
    'code': Random.hexString(50),
    'broadcastUser': userId,
    'createdAt': new Date(),
  });
}


// request allow access for a user
// user will be allowed to access the site if he is invited
// and his profile is complete
var requestAccess = function() {

  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user");

  if (Meteor.user().allowAccess)
    throw new Meteor.Error(500, "User has already access to the site.");

  if (!Meteor.user().isInvited)
    throw new Meteor.Error(500, "User hasn't used an invitation code.");

  if (!Meteor.user().profile.email || !Meteor.user().profile.name)
    throw new Meteor.Error(500, "User profile is incomplete.");

  // access allowed!

  // allow access for this user
  Meteor.users.update(Meteor.userId(), {$set: {allowAccess: true}});
}


// test some functionality
// XXX, check secutiry for client-calls
var test = function() {
  /* empty */
}


// define methods that can be called from the client-side
Meteor.methods({
  "requestAccess": requestAccess,
  "verifyInvitationCode": verifyInvitationCode,
  "addServiceToUser": addServiceToCurrentUser,
  "removeServiceFromUser": removeServiceFromCurrentUser,
  "test": test 
});



