

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



// When an user account is created (when user is logging in through a service)
// collect the user's information that is provided by the service and store 
// the most important information in the user's document/entry

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile;
  user.profile.social = {};

  var facebook = user.services.facebook;
  var github = user.services.github;
  var twitter = user.services.twitter;
  
  if (github) {
    user.profile.social.github   = github.username ? "http://github.com/" + github.username : "";
    if (github.email) 
      user.emails                = [{ address: github.email, verified: true }];
  } else if (facebook) {
    user.profile.social.facebook = facebook.link || "";
    user.profile.gender          = facebook.gender || "";
    user.profile.lang            = facebook.locale ? facebook.locale.substr(0,2) : "";
    if (facebook.email)
      user.emails                = [{ address: facebook.email, verified: true }];
  } else if (twitter) {
    user.profile.social.twitter  = twitter.screenName ? "http://twitter.com/" + twitter.screenName : "";
    user.profile.avatar          = twitter.profile_image_url || "";
    user.profile.lang            = twitter.lang || "";
    /* twitter don't provide an e-mailaddress of the user */ 
  }

  return user;
});



