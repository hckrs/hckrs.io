

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

