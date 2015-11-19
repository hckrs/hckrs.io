
// Register external services
// that can be used for user account creation and login.
// This will be done once, at the first time you run meteor.

var externalServices = {
  'facebook': ["appId", 'secret'],
  'github': ["clientId", 'secret'],
  'twitter': ["consumerKey", 'secret'],
}

Meteor.startup(function() {

  // register external login services
  _.each(externalServices, function(fields, serviceName) {
    var modifier = {};
    modifier.service = serviceName;
    modifier[fields[0]] = Settings[serviceName][fields[0]];
    modifier[fields[1]] = Settings[serviceName][fields[1]];
    Accounts.loginServiceConfiguration.upsert({service: serviceName}, {$set: modifier});
  });
 
});
