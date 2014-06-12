

// Register external services
// that can be used for user account creation and login.
// This will be done once, at the first time you run meteor.




Meteor.startup(function() {

  // check which services are already configured
  var facebookConfigured = Accounts.loginServiceConfiguration.findOne({service: 'facebook'});
  var githubConfigured = Accounts.loginServiceConfiguration.findOne({service: 'github'});
  var twitterConfigured = Accounts.loginServiceConfiguration.findOne({service: 'twitter'});

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
// we try to make user's info complete

// @param user {Object} (an user object)
// @param service String (facebook, github, twitter, etc.)
var fetchServiceUserData = function(user, service) {

  var services = {
  
    "github": function(user) {
      var fields = ["id","accessToken","email", "privateEmails","username","login","avatar_url","gravatar_id","html_url","name","company","blog","location"]
      var data = HTTP.get("https://api.github.com/user", {
        headers: {"User-Agent": "Meteor/"+Meteor.release},
        params: {access_token: user.services[service].accessToken}
      }).data;
      data.privateEmails = HTTP.get("https://api.github.com/user/emails", {
        headers: {"User-Agent": "Meteor/"+Meteor.release},
        params: {access_token: user.services[service].accessToken}
      }).data; // XXX API response format for /user/emails will change in the future
      return _.pick(data, fields);;
    },
    
    "facebook": function(user) {
      var url = "https://graph.facebook.com/me";
      var fields = ['id', 'email', 'name', 'locale', 'picture', 'link', 'username', 'location', 'birthday', 'gender', 'website', 'work'];
      return oauthCall(user, 'facebook', 'GET', url, {fields: fields}).data;
    },
    
    "twitter": function(user) {
      var url = "https://api.twitter.com/1.1/account/verify_credentials.json";
      var fields = ['id','id_str','accessToken','profile_image_url','name','screen_name','location','entities'];
      var data = oauthCall(user, 'twitter', 'GET', url).data;
      data.id = data.id_str;
      return _.pick(data, fields);
    }
  }

  if (!services[service])
    throw new Meteor.Error(500, "Unknow how to fetch user data from " + service);    

  // return the fetched data
  return services[service](user);
}


// transform the raw service data into a uniform format
// that is the same for all services. The transformed data
// can be used to make user's profile complete
var uniformServiceData = function(data, service) {

  var services = {
  
    "github": function(data) {

      if (data.avatar_url)
        data.picture = data.avatar_url + "&size=180"

      if (data.location)
        data.location = geocode(data.location);

      // check for private mailaddress when public email isn't setted
      if (!data.email && data.privateEmails) { 
        var emails = _.filter(data.privateEmails, function(email) {
          return _.isString(email) && email.indexOf("@users.noreply.github.com") === -1;
        });
        data.email = _.first(emails);
      }

      var userData = {
        'email': data.email,
        'name': data.name,
        'picture': data.picture,
        'link': data.html_url,
        'company': data.company,
        'homepage': data.blog,
        'location': data.location,
        
        // 'username': data.login,
        // 'birthday': data.birthday || null,
        // 'city': data.location,
        // 'lang': data.lang || null
      };

      return userData;
    },
    
    "facebook": function(data) {

      if (data.birthday) {
        var p = data.birthday.split('/');
        data.birthday = new Date(p[2], p[0], p[1]);
      }

      if (data.username && data.picture && data.picture.data && !data.picture.data.is_silhouette)
        data.picture = "https://graph.facebook.com/" + data.username + "/picture?type=large";

      if (data.location && data.location.name)
        data.location = geocode(data.location.name);

      if (data.work && data.work[0] && data.work[0].employer)
        data.company = data.work[0].employer.name;
      
      var userData = {
        'email': data.email,
        'name': data.name,
        'picture': data.picture,
        'link': data.link,
        'company': data.company, // XXX TODO ? working???
        'homepage': data.website,
        'location': data.location,
        
        // 'username': data.username,
        // 'birthday': data.birthday,
        // 'city': data.location && data.location.name, //XXX TODO: use additional data.location.id 
        // 'lang': data.locale && data.locale.substr(0,2)
      };

      return userData;
    },
    
    "twitter": function(data) {
    
      if (!data.default_profile_image && data.profile_image_url)
        // remove '_normal' from url to get original size
        data.picture = data.profile_image_url.replace(/_normal(.{0,5})$/, '$1');

      var urls = pathValue(data, 'entities.url.urls');
      if (urls && urls[0])
        data.homepage = urls[0].expanded_url;

      if (data.location)
        data.location = geocode(data.location);

      if (data.screen_name)
        data.link = "http://twitter.com/" + data.screen_name

      var userData = {
        'email': null, // not available
        'name': data.name,
        'picture': data.picture,
        'link': data.link,
        'company': null, // not available
        'homepage': data.homepage,
        'location': data.location,
        
        // 'username': data.screen_name,
        // 'birthday': data.birthday || null,
        // 'city': data.location,
        // 'lang': data.lang
      };

      return userData;
    }
  }

  if (!services[service])
    throw new Meteor.Error(500, "Unknow service " + service);    

  // return the fetched data
  return omitNull(services[service](data));
}



// extending the user's profile with the given data
// the given data must be in uniform format
var extendUserProfile = function(user, userData, service) {
  
  // data used for creating the user profile
  var extract = ['name', 'email', 'company', 'homepage', 'location' /*, 'gender', 'birthday'*/];
  var data = _.pick(userData, extract);
  
  // fill undefined or null properties in user's profile with the new user data
  user.profile = _.defaults(omitNull(user.profile), data); 
 
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

  return user;
}




// fetching additional user information from the service
// and attach it to the service object.
// then a new user profile is created by filling in the gaps.

// @param user {Object} (an user object)
// @param service String (facebook, github, twitter, etc.)
// @return {Object} (the same user object with additional info attached to it)
var extendUserByFetchingService = function(user, service) {
  
  // fetch additional user data from service
  var serviceData = fetchServiceUserData(user, service);

  // attach the new service data directly
  user.services[service] = _.extend(user.services[service], serviceData);

  // transform service data in uniform format
  var userData = uniformServiceData(serviceData, service);

  // extending the user's profile
  user = extendUserProfile(user, userData, service);
  
  return user;
}




// merge two user objects
// merge the second user in the first one, returning a copy of the result
// notice that some properties must be handled manually
var mergeUserData = function(firstUser, secondUser) {

  // merge 2 objects (copy right properties to left, it will override always)
  var mergedData = _.deepExtend(_.deepClone(secondUser), _.deepClone(firstUser)); 

  // XXX arrays are considered as sets when working with primitives.
  // but objects in arrays are compared on their pointer (no deep equality testing)

  // remove duplicate emails
  mergedData.emails = uniqFilter(mergedData.emails);

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

  return mergedData;
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
  var mergedUserData = mergeUserData(surviveUser, zombieUser);
  removeUser(zombieUser._id);
  Meteor.users.update(zombieUser._id, {$set: {mergedWith: surviveUser._id}});
  Meteor.users.update(surviveUser._id, mergedUserData);

  // replace all userID references in other collections
  Invitations.update({broadcastUser: zombieUser._id}, {$set: {broadcastUser: surviveUser._id}}, {multi: true});
  Invitations.update({receivingUser: zombieUser._id}, {$set: {receivingUser: surviveUser._id}}, {multi: true});
  Meteor.users.update({mergedWith: zombieUser._id}, {$set: {mergedWith: surviveUser._id}}, {multi: true});

  return surviveUser;
}



// find an existing user that matches the idenity of the given user data
// probably this is the same user and we can merge the accounts afterwards
var findExistingUser = function(userData) {

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


// When an user account is created (after user is logging in for the first time)
// extract the important user information and return a new user object where this
// information is associated in user's profile.
// XXX TODO: also update user's profile when user logged in in the future.

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile;

  // determine which external service is used for account creation
  var serviceName = _.first(_.keys(_.omit(user.services, ['resume'])));

  // fetch additional user information
  // extend user object with additional fetched user information
  user = extendUserByFetchingService(user, serviceName);

  // find an existing user that probaly match this identity
  var existingUser = findExistingUser(user);  


  if (existingUser) { 

    // merge data from existing user if exists
    user = mergeUserData(existingUser, user);
    Meteor.users.remove(existingUser._id);

  } else { 
    // additional information, for new user only!  

    // make the first user within the system admin
    if (Meteor.users.find().count() === 0)
      user.isAdmin = true;

    // don't allow access until user completes his profile
    user.isUninvited = !user.isAdmin;
    user.isAccessDenied = true;
    user.isHidden = true;
    user.isIncompleteProfile = true;

  }
  
  // create new user account
  return user; 
});


// attach user to some city, which is an additonal step
// in the registration process, because the city is unknow
// within the onCreateUser function exposed by meteor.
var attachUserToCity = function(city) {
  check(city, Match.In(_.pluck(CITIES, 'key')));
  check(this.userId, String);
  var user = Users.findOne(this.userId);
  if (!user)
    throw new Meteor.Error(0, "user doesn't exist!") 
  if (user.city)
    throw new Meteor.Error(0, "already attached to a city!") 
  
  // get city info including ranks for this (new) user
  var userCityInfo = newUserCityInfo(city);

  // update user with city information
  Users.update(user._id, {$set: userCityInfo});

  // let admins know that a new user has registered the site
  SendEmailOnNewUser(user);
}

var newUserCityInfo = function(city) {
  var user = {}; // create object to build city info for new user

  // set the city where this user becomes registered
  user.city = city;

  // determine and set the hacker ranking
  var local = Meteor.users.findOne({city: city}, {sort: {localRank: -1}});
  var global = Meteor.users.findOne({}, {sort: {globalRank: -1}});
  user.localRank = (local && local.localRank || 0) + 1;
  user.globalRank = (global && global.globalRank || 0) + 1;

  // make the first user of a city the mayor
  if (user.localRank === 1)
    user.isMayor = true;

  // set invitation phrase
  user.invitationPhrase = user.globalRank * 2 + 77;

  // give this user the default number of invite codes
  user.invitations = Meteor.settings.defaultNumberOfInvitesForNewUsers || 0;

  return user;
}




// Remove an account
// this is be done be marking an account as deleted rather than deleting permanently
var removeUser = function(userId) {
  Meteor.users.update(userId, {$set: {'isHidden': true, 'isDeleted': true, 'deletedAt': new Date(), 'emails': [], 'services': {}}});
  Meteor.users.update(userId, {$set: {'services.resume.loginTokens': []}});
}


// Remove e-mailaddress from user's account that aren't in use
// This is the case when it is not used by a social services
// or manually filled in in the user's profile
cleanEmailAddress = function(userId) { 
  var user = Meteor.users.findOne(userId);
  
  var usedEmails = _.map(user.services, function(s) { return s.email; });
  usedEmails.push(user.profile.email);
  usedEmails = _.compact(usedEmails);
  
  // remove emails that arn't in use
  Meteor.users.update(userId, {$pull: {'emails': {'address': {$nin: usedEmails}}}});
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
var addServiceToCurrentUser = function(token, secret, service) {
  check(token, String);
  check(secret, String);
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
  var serviceResponse = Service.retrieveCredential(token, secret);
  var serviceData = serviceResponse && serviceResponse.serviceData;

  if(!serviceData)
    throw new Meteor.Error(500, "Unknow service data: " + serviceData);

  // extend the user with the service data
  extendedUser.services[service] = serviceData;

  // fetch additional user information
  // merge fetched data into the user object
  extendedUser = extendUserByFetchingService(extendedUser, service);

  // after replacing the previous service data
  // some e-mailaddress can be become unused, clean them
  Meteor.setTimeout(_.partial(cleanEmailAddress, userId), 10000);


  // check if the requested external account is already assigned to an other user account
  var existingUser1 = Meteor.users.findOne(_.object([
    ["services."+service+".id", serviceData.id], 
    ['_id', {$ne: userId}]
  ]));

  // check if there is an other user with the same email -> merge
  var existingUser2 = findExistingUser(extendedUser);
  




  
    
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

  // create modifiers
  var unsetModifier = _.object([
    //["services."+service, true], // DON'T DELETE SERVICE DATA (it create ghost accounts)
    ["profile.social."+service, true], // only delete the link to user's social profile
    // ["profile.socialPicture."+service, true] // don't delete the profile picture
  ]);

  // remove service data
  Meteor.users.update(userId, {$unset: unsetModifier}); 
}





// when user created an account he hasn't directly full access
// the client can call this function to verify the invitation phrase
// so we can permit access for this user
var verifyInvitation = function(phrase) {
  if (!Meteor.user())
    throw new Meteor.Error(500, "Unknow user.");

  verifyInvitationOfUser(phrase, Meteor.userId());
}

// when this function is called, is must already be verified that 
// the user is allowed to do this operation
// (also called from Admin.js)
verifyInvitationOfUser = function(phrase, userId) { 
  check(phrase, Number);
  check(userId, String);

  // search broadcast user
  var broadcastUser = Meteor.users.findOne({invitationPhrase: phrase});
  if (broadcastUser.mergedWith)
    broadcastUser = Meteor.users.findOne(broadcastUser.mergedWith);

  // receiving user
  var receivingUser = Meteor.users.findOne(userId);

  if (!receivingUser)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (!receivingUser.isUninvited)
    throw new Meteor.Error(500, "User is already invited.");

  if (!broadcastUser)
    throw new Meteor.Error(500, "Unknow broadcast user");

  if (broadcastUser.invitations < 1)
    throw new Meteor.Error(200, "limit", "Invitation limit reached.");
  
  // invitation valid

  // insert invitation couple in database
  Invitations.insert({
    broadcastUser: broadcastUser._id,
    receivingUser: userId, 
    signedupAt: new Date()
  });  

  // mark as invited
  forceInvitationOfUser(receivingUser._id);

  // decrement broadcast user's unused invitations
  Meteor.users.update(broadcastUser._id, {$inc: {invitations: -1}});
}

// when this function is called, is must already be verified that 
// the user is allowed to do this operation
// (also called from Admin.js)
forceInvitationOfUser = function(userId) {
  check(userId, String);

  // receiving user
  if (!Meteor.users.findOne(userId))
    throw new Meteor.Error(500, "Unknow user: " + userId);

  // mark as invited
  Meteor.users.update(userId, {$unset: {isUninvited: true}});

  // check if user now get access to the website
  requestAccessOfUser(userId); 
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

  requestAccessOfUser(Meteor.userId());
}

// when this function is called, is must already be verified that 
// the user is allowed to do this operation
var requestAccessOfUser = function(userId) {
  var user = Meteor.users.findOne(userId);

  if (!user)
    throw new Meteor.Error(500, "Unknow user");

  if (user.isAccessDenied != true)
    throw new Meteor.Error(500, "User has already access to the site.");

  if (user.isUninvited)
    throw new Meteor.Error(500, "notInvited", "User hasn't used an invitation code.");

  if (user.isIncompleteProfile)
    throw new Meteor.Error(500, "profileIncomplete", "User profile is incomplete.");

  if (!_.findWhere(user.emails, {address: user.profile.email, verified: true}))
    throw new Meteor.Error(500, "emailNotVerified", "e-mailaddress isn't verified.");

  // access allowed!

  // allow access for this user
  Meteor.users.update(userId, {$unset: {isAccessDenied: true}});

  // request visibility
  requestVisibilityOfUser(userId);
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


// test some functionality
// XXX, check secutiry for client-calls
var test = function() {
  /* empty */
}


// define methods that can be called from the client-side
Meteor.methods({
  "requestAccess": requestAccess,
  "requestProfileCompleted": requestProfileCompleted,
  "verifyInvitation": verifyInvitation,
  "addServiceToUser": addServiceToCurrentUser,
  "removeServiceFromUser": removeServiceFromCurrentUser,
  "attachUserToCity": attachUserToCity,
  "test": test 
});



