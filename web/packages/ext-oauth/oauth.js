
// Manually creating OAuth requests to the external services.
// In this manner you can obtain all information about a user
// Don't forget to set requestPermission that the user must accept.
//
// Note: that the accessToken you use have to correspondent with the
// ServiceConfiguration settings. So you cann't do requests on a development
// machine while using the accessTokens from production machine.

// @param user String|{Object} (either a userId or an user object)
// @param service String (facebook, github, twitter, etc.)
// @param method String (GET, POST, etc.)
// @param url String (url of the resource you request)
// @param params {Object} (data send with the request)
OAuth.userCall = function(user, service, method, url, params) {  
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