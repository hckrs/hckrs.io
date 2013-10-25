

// Register external services
// that can be used for user account creation and login.
// This will be done once, at the first time you run meteor.

// check which services are already configured
var facebookConfigured = Accounts.loginServiceConfiguration.findOne({service: 'facebook'});
var githubConfigured = Accounts.loginServiceConfiguration.findOne({service: 'github'});
var twitterConfigured = Accounts.loginServiceConfiguration.findOne({service: 'twitter'});

// XXX TODO: do not write the 'id' and 'secret' directly into the code
// this must be stored seperately, for example in a settings file or 
// exported as environment variables.

// register facebook
if(!facebookConfigured) {
  Accounts.loginServiceConfiguration.insert({
    service: "facebook",
    appId: "609216679124014",
    secret: "fd5a223e32c042aeeddb98c115b3e6a3"
  });
}

// register github app
if(!githubConfigured) {
  Accounts.loginServiceConfiguration.insert({
    service: "github",
    clientId: "de739c0911eca800a0fb",
    secret: "2d10760b04a24bca2f82c823d8e112a9585f3400"
  });
}

// register twitter app
if(!twitterConfigured) {
  Accounts.loginServiceConfiguration.insert({
    service: "twitter",
    consumerKey: "zZzPfXGKfu523POv6xrFPA",
    secret: "CJMdzdwCCKxhmeEpsum8Mqf1P5R7L0ksq4h0Qp16hOo"
  });
}



// When an user account is created (after user is logging in for the first time)
// extract the important user information and return a new user object where this
// information is associated in user's profile.

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile;

  // extract serviceData that meteor has stored in the user object
  var serviceObj = _.pick(user.services, ['github', 'facebook', 'twitter']);
  var serviceName = _.first(_.keys(serviceObj));
  var serviceData = _.first(_.values(serviceObj));
  
  // update user's profile by extraction information from the serviceData
  user = updateUserProfileWithServiceData(user, serviceData, serviceName);
  
  // return the new user object that will be used for account creation
  return user;
});


// Every external service has some different user information they provide.
// The function below extract the important user data and associate it to
// the user's profile.

var updateUserProfileWithServiceData = function(user, serviceData, service) {

  if (!user.profile)
    user.profile = {};
  
  if (!user.profile.social)
    user.profile.social = {};

  // extract important user data (provided by the service)
  // and associate it to the user's profile
  switch (service) {
    case 'github':
      user.profile.social.github   = serviceData.username ? "http://github.com/" + serviceData.username : "";      
      break;
    case 'facebook':
      user.profile.social.facebook = serviceData.link || "";
      user.profile.gender          = serviceData.gender || "";
      user.profile.lang            = serviceData.locale ? serviceData.locale.substr(0,2) : "";
      if (serviceData.birthday) {
        var parts = serviceData.birthday.split('/');
        user.profile.birthdate     = new Date(parts[2], parts[0], parts[1]);
      }
      break;
    case 'twitter':
      user.profile.social.twitter  = serviceData.screenName ? "http://twitter.com/" + serviceData.screenName : "";
      user.profile.avatar          = serviceData.profile_image_url || "";
      user.profile.lang            = serviceData.lang || "";
      break;
  }

  // extract e-mailaddress
  if (serviceData.email) {
    if (!user.emails) user.emails = [];
    if (!_.findWhere(user.emails, {address: serviceData.email}))
      user.emails.push({ address: serviceData.email, verified: true });
  }

  return user;
}


// Existing users can link additional social services to their accounts.
// Therefor a service token is required to fetch user data from the external service. 
// This token can obtained on the client-side when the user authenticate the service.
// After the token is obtained, the server method below can be called and it will fetch 
// user information from the external service and update user's profile.

var addServiceToCurrentUser = function(token, service) {
  var userId = this.userId; //current logged in user
  var user = Meteor.users.findOne(userId); //get user document from our collection
  var Service = global[capitaliseFirstLetter(service)]; //meteor package for this external service

  if (!userId || !user)
    throw new Meteor.Error(500, "Unknow user: " + userId);

  if (!Service)
    throw new Meteor.Error(500, "Unknow service: " + service);


  // retrieve user data from the external service
  var serviceData = Service.retrieveCredential(token).serviceData;

  // check if the requested external account is already assigned to an (other) user
  var query = _.object(["service."+service+".id"], [serviceData.id]);
  if (Meteor.users.findOne(query))
    throw new Meteor.Error(500, "This "+service+" account has already assigned to a user.");

  // attach service data to current user
  user.services[service] = serviceData;

  // update users profile with new information
  user = updateUserProfileWithServiceData(user, serviceData, service);

  // replace the whole user by the updated one
  Meteor.users.update(userId, user);
}



// define methods that can be called from the client-side
Meteor.methods({
  "addServiceToUser": addServiceToCurrentUser
});

