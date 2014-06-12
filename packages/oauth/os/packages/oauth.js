(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/oauth_server.js                                                                 //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
var Fiber = Npm.require('fibers');                                                                // 1
var url = Npm.require('url');                                                                     // 2
                                                                                                  // 3
OAuth = {};                                                                                       // 4
OAuthTest = {};                                                                                   // 5
                                                                                                  // 6
RoutePolicy.declare('/_oauth/', 'network');                                                       // 7
                                                                                                  // 8
var registeredServices = {};                                                                      // 9
                                                                                                  // 10
// Internal: Maps from service version to handler function. The                                   // 11
// 'oauth1' and 'oauth2' packages manipulate this directly to register                            // 12
// for callbacks.                                                                                 // 13
//                                                                                                // 14
OAuth._requestHandlers = {};                                                                      // 15
                                                                                                  // 16
                                                                                                  // 17
// Register a handler for an OAuth service. The handler will be called                            // 18
// when we get an incoming http request on /_oauth/{serviceName}. This                            // 19
// handler should use that information to fetch data about the user                               // 20
// logging in.                                                                                    // 21
//                                                                                                // 22
// @param name {String} e.g. "google", "facebook"                                                 // 23
// @param version {Number} OAuth version (1 or 2)                                                 // 24
// @param urls   For OAuth1 only, specify the service's urls                                      // 25
// @param handleOauthRequest {Function(oauthBinding|query)}                                       // 26
//   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider           // 27
//   - (For OAuth2 only) query {Object} parameters passed in query string                         // 28
//   - return value is:                                                                           // 29
//     - {serviceData:, (optional options:)} where serviceData should end                         // 30
//       up in the user's services[name] field                                                    // 31
//     - `null` if the user declined to give permissions                                          // 32
//                                                                                                // 33
OAuth.registerService = function (name, version, urls, handleOauthRequest) {                      // 34
  if (registeredServices[name])                                                                   // 35
    throw new Error("Already registered the " + name + " OAuth service");                         // 36
                                                                                                  // 37
  registeredServices[name] = {                                                                    // 38
    serviceName: name,                                                                            // 39
    version: version,                                                                             // 40
    urls: urls,                                                                                   // 41
    handleOauthRequest: handleOauthRequest                                                        // 42
  };                                                                                              // 43
};                                                                                                // 44
                                                                                                  // 45
// For test cleanup.                                                                              // 46
OAuthTest.unregisterService = function (name) {                                                   // 47
  delete registeredServices[name];                                                                // 48
};                                                                                                // 49
                                                                                                  // 50
                                                                                                  // 51
OAuth.retrieveCredential = function(credentialToken, credentialSecret) {                          // 52
  return OAuth._retrievePendingCredential(credentialToken, credentialSecret);                     // 53
};                                                                                                // 54
                                                                                                  // 55
                                                                                                  // 56
// Listen to incoming OAuth http requests                                                         // 57
WebApp.connectHandlers.use(function(req, res, next) {                                             // 58
  // Need to create a Fiber since we're using synchronous http calls and nothing                  // 59
  // else is wrapping this in a fiber automatically                                               // 60
  Fiber(function () {                                                                             // 61
    middleware(req, res, next);                                                                   // 62
  }).run();                                                                                       // 63
});                                                                                               // 64
                                                                                                  // 65
middleware = function (req, res, next) {                                                          // 66
  // Make sure to catch any exceptions because otherwise we'd crash                               // 67
  // the runner                                                                                   // 68
  try {                                                                                           // 69
    var serviceName = oauthServiceName(req);                                                      // 70
    if (!serviceName) {                                                                           // 71
      // not an oauth request. pass to next middleware.                                           // 72
      next();                                                                                     // 73
      return;                                                                                     // 74
    }                                                                                             // 75
                                                                                                  // 76
    var service = registeredServices[serviceName];                                                // 77
                                                                                                  // 78
    // Skip everything if there's no service set by the oauth middleware                          // 79
    if (!service)                                                                                 // 80
      throw new Error("Unexpected OAuth service " + serviceName);                                 // 81
                                                                                                  // 82
    // Make sure we're configured                                                                 // 83
    ensureConfigured(serviceName);                                                                // 84
                                                                                                  // 85
    var handler = OAuth._requestHandlers[service.version];                                        // 86
    if (!handler)                                                                                 // 87
      throw new Error("Unexpected OAuth version " + service.version);                             // 88
    handler(service, req.query, res);                                                             // 89
  } catch (err) {                                                                                 // 90
    // if we got thrown an error, save it off, it will get passed to                              // 91
    // the appropriate login call (if any) and reported there.                                    // 92
    //                                                                                            // 93
    // The other option would be to display it in the popup tab that                              // 94
    // is still open at this point, ignoring the 'close' or 'redirect'                            // 95
    // we were passed. But then the developer wouldn't be able to                                 // 96
    // style the error or react to it in any way.                                                 // 97
    if (req.query.state && err instanceof Error) {                                                // 98
      try { // catch any exceptions to avoid crashing runner                                      // 99
        OAuth._storePendingCredential(req.query.state, err);                                      // 100
      } catch (err) {                                                                             // 101
        // Ignore the error and just give up. If we failed to store the                           // 102
        // error, then the login will just fail with a generic error.                             // 103
        Log.warn("Error in OAuth Server while storing pending login result.\n" +                  // 104
                 err.stack || err.message);                                                       // 105
      }                                                                                           // 106
    }                                                                                             // 107
                                                                                                  // 108
    // XXX the following is actually wrong. if someone wants to                                   // 109
    // redirect rather than close once we are done with the OAuth                                 // 110
    // flow, as supported by                                                                      // 111
    // Oauth_renderOauthResults, this will still                                                  // 112
    // close the popup instead. Once we fully support the redirect                                // 113
    // flow (by supporting that in places such as                                                 // 114
    // packages/facebook/facebook_client.js) we should revisit this.                              // 115
    //                                                                                            // 116
    // close the popup. because nobody likes them just hanging                                    // 117
    // there.  when someone sees this multiple times they might                                   // 118
    // think to check server logs (we hope?)                                                      // 119
    closePopup(res);                                                                              // 120
  }                                                                                               // 121
};                                                                                                // 122
                                                                                                  // 123
OAuthTest.middleware = middleware;                                                                // 124
                                                                                                  // 125
// Handle /_oauth/* paths and extract the service name.                                           // 126
//                                                                                                // 127
// @returns {String|null} e.g. "facebook", or null if this isn't an                               // 128
// oauth request                                                                                  // 129
var oauthServiceName = function (req) {                                                           // 130
  // req.url will be "/_oauth/<service name>?<action>"                                            // 131
  var barePath = req.url.substring(0, req.url.indexOf('?'));                                      // 132
  var splitPath = barePath.split('/');                                                            // 133
                                                                                                  // 134
  // Any non-oauth request will continue down the default                                         // 135
  // middlewares.                                                                                 // 136
  if (splitPath[1] !== '_oauth')                                                                  // 137
    return null;                                                                                  // 138
                                                                                                  // 139
  // Find service based on url                                                                    // 140
  var serviceName = splitPath[2];                                                                 // 141
  return serviceName;                                                                             // 142
};                                                                                                // 143
                                                                                                  // 144
// Make sure we're configured                                                                     // 145
var ensureConfigured = function(serviceName) {                                                    // 146
  if (!ServiceConfiguration.configurations.findOne({service: serviceName})) {                     // 147
    throw new ServiceConfiguration.ConfigError();                                                 // 148
  }                                                                                               // 149
};                                                                                                // 150
                                                                                                  // 151
// Internal: used by the oauth1 and oauth2 packages                                               // 152
OAuth._renderOauthResults = function(res, query, credentialSecret) {                              // 153
  // We support ?close and ?redirect=URL. Any other query should just                             // 154
  // serve a blank page. For tests, we support the                                                // 155
  // `only_credential_secret_for_test` parameter, which just returns the                          // 156
  // credential secret without any surrounding HTML. (The test needs to                           // 157
  // be able to easily grab the secret and use it to log in.)                                     // 158
  if (query.only_credential_secret_for_test) {                                                    // 159
    res.writeHead(200, {'Content-Type': 'text/html'});                                            // 160
    res.end(credentialSecret, 'utf-8');                                                           // 161
  } else if (query.error) {                                                                       // 162
    Log.warn("Error in OAuth Server: " + query.error);                                            // 163
    closePopup(res);                                                                              // 164
  } else if ('close' in query) { // check with 'in' because we don't set a value                  // 165
    closePopup(res, query.state, credentialSecret);                                               // 166
  } else if (query.redirect) {                                                                    // 167
    // Only redirect to URLs on the same domain as this app.                                      // 168
    // XXX No code in core uses this code path right now.                                         // 169
    // XXX In order for the redirect flow to be fully supported, we'd                             // 170
    // have to communicate the credentialSecret back to the app somehow.                          // 171
    var redirectHostname = url.parse(query.redirect).hostname;                                    // 172
    var appHostname = url.parse(Meteor.absoluteUrl()).hostname;                                   // 173
    if (appHostname === redirectHostname) {                                                       // 174
      // We rely on node to make sure the header is really only a single header                   // 175
      // (not, for example, a url with a newline and then another header).                        // 176
      res.writeHead(302, {'Location': query.redirect});                                           // 177
    } else {                                                                                      // 178
      res.writeHead(400);                                                                         // 179
    }                                                                                             // 180
    res.end();                                                                                    // 181
  } else {                                                                                        // 182
    res.writeHead(200, {'Content-Type': 'text/html'});                                            // 183
    res.end('', 'utf-8');                                                                         // 184
  }                                                                                               // 185
};                                                                                                // 186
                                                                                                  // 187
var closePopup = function(res, state, credentialSecret) {                                         // 188
                                                                                                  // 189
  var isSafe = function (value) {                                                                 // 190
    // This matches strings generated by `Random.secret` and                                      // 191
    // `Random.id`.                                                                               // 192
    return typeof value === "string" &&                                                           // 193
      /^[a-zA-Z0-9\-_]+$/.test(value);                                                            // 194
  };                                                                                              // 195
                                                                                                  // 196
  res.writeHead(200, {'Content-Type': 'text/html'});                                              // 197
  // If we have a credentialSecret, report it back to the parent window, with                     // 198
  // the corresponding state (which we sanitize because it came from a                            // 199
  // query parameter). The parent window uses the state and credential secret                     // 200
  // to log in over DDP.                                                                          // 201
  var setCredentialSecret = '';                                                                   // 202
  if (state && credentialSecret && isSafe(state) && isSafe(credentialSecret)) {                   // 203
    setCredentialSecret = 'window.opener && ' +                                                   // 204
      'window.opener.Package.oauth.OAuth._handleCredentialSecret(' +                              // 205
      JSON.stringify(state) + ', ' + JSON.stringify(credentialSecret) + ');';                     // 206
  }                                                                                               // 207
  var host = Npm.require("url").parse(Meteor.absoluteUrl()).hostname, content =                   // 208
        '<html><head><script>' + 'document.domain="'+host+'";' +                                  // 209
        setCredentialSecret +                                                                     // 210
        'window.close()</script></head></html>';                                                  // 211
  res.end(content, 'utf-8');                                                                      // 212
};                                                                                                // 213
                                                                                                  // 214
                                                                                                  // 215
var OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption; // 216
                                                                                                  // 217
var usingOAuthEncryption = function () {                                                          // 218
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();                                        // 219
};                                                                                                // 220
                                                                                                  // 221
// Encrypt sensitive service data such as access tokens if the                                    // 222
// "oauth-encryption" package is loaded and the oauth secret key has                              // 223
// been specified.  Returns the unencrypted plaintext otherwise.                                  // 224
//                                                                                                // 225
// The user id is not specified because the user isn't known yet at                               // 226
// this point in the oauth authentication process.  After the oauth                               // 227
// authentication process completes the encrypted service data fields                             // 228
// will be re-encrypted with the user id included before inserting the                            // 229
// service data into the user document.                                                           // 230
//                                                                                                // 231
OAuth.sealSecret = function (plaintext) {                                                         // 232
  if (usingOAuthEncryption())                                                                     // 233
    return OAuthEncryption.seal(plaintext);                                                       // 234
  else                                                                                            // 235
    return plaintext;                                                                             // 236
}                                                                                                 // 237
                                                                                                  // 238
// Unencrypt a service data field, if the "oauth-encryption"                                      // 239
// package is loaded and the field is encrypted.                                                  // 240
//                                                                                                // 241
// Throws an error if the "oauth-encryption" package is loaded and the                            // 242
// field is encrypted, but the oauth secret key hasn't been specified.                            // 243
//                                                                                                // 244
OAuth.openSecret = function (maybeSecret, userId) {                                               // 245
  if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret))                     // 246
    return maybeSecret;                                                                           // 247
                                                                                                  // 248
  return OAuthEncryption.open(maybeSecret, userId);                                               // 249
};                                                                                                // 250
                                                                                                  // 251
// Unencrypt fields in the service data object.                                                   // 252
//                                                                                                // 253
OAuth.openSecrets = function (serviceData, userId) {                                              // 254
  var result = {};                                                                                // 255
  _.each(_.keys(serviceData), function (key) {                                                    // 256
    result[key] = OAuth.openSecret(serviceData[key], userId);                                     // 257
  });                                                                                             // 258
  return result;                                                                                  // 259
};                                                                                                // 260
                                                                                                  // 261
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/pending_credentials.js                                                          //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
//                                                                                                // 1
// When an oauth request is made, Meteor receives oauth credentials                               // 2
// in one browser tab, and temporarily persists them while that                                   // 3
// tab is closed, then retrieves them in the browser tab that                                     // 4
// initiated the credential request.                                                              // 5
//                                                                                                // 6
// _pendingCredentials is the storage mechanism used to share the                                 // 7
// credential between the 2 tabs                                                                  // 8
//                                                                                                // 9
                                                                                                  // 10
                                                                                                  // 11
// Collection containing pending credentials of oauth credential requests                         // 12
// Has key, credential, and createdAt fields.                                                     // 13
OAuth._pendingCredentials = new Meteor.Collection(                                                // 14
  "meteor_oauth_pendingCredentials", {                                                            // 15
    _preventAutopublish: true                                                                     // 16
  });                                                                                             // 17
                                                                                                  // 18
OAuth._pendingCredentials._ensureIndex('key', {unique: 1});                                       // 19
OAuth._pendingCredentials._ensureIndex('credentialSecret');                                       // 20
OAuth._pendingCredentials._ensureIndex('createdAt');                                              // 21
                                                                                                  // 22
                                                                                                  // 23
                                                                                                  // 24
// Periodically clear old entries that were never retrieved                                       // 25
var _cleanStaleResults = function() {                                                             // 26
  // Remove credentials older than 1 minute                                                       // 27
  var timeCutoff = new Date();                                                                    // 28
  timeCutoff.setMinutes(timeCutoff.getMinutes() - 1);                                             // 29
  OAuth._pendingCredentials.remove({ createdAt: { $lt: timeCutoff } });                           // 30
};                                                                                                // 31
var _cleanupHandle = Meteor.setInterval(_cleanStaleResults, 60 * 1000);                           // 32
                                                                                                  // 33
                                                                                                  // 34
// Stores the key and credential in the _pendingCredentials collection.                           // 35
// Will throw an exception if `key` is not a string.                                              // 36
//                                                                                                // 37
// @param key {string}                                                                            // 38
// @param credential {Object}   The credential to store                                           // 39
// @param credentialSecret {string} A secret that must be presented in                            // 40
//   addition to the `key` to retrieve the credential                                             // 41
//                                                                                                // 42
OAuth._storePendingCredential = function (key, credential, credentialSecret) {                    // 43
  check(key, String);                                                                             // 44
  check(credentialSecret, Match.Optional(String));                                                // 45
                                                                                                  // 46
  if (credential instanceof Error) {                                                              // 47
    credential = storableError(credential);                                                       // 48
  } else {                                                                                        // 49
    credential = OAuth.sealSecret(credential);                                                    // 50
  }                                                                                               // 51
                                                                                                  // 52
  // We do an upsert here instead of an insert in case the user happens                           // 53
  // to somehow send the same `state` parameter twice during an OAuth                             // 54
  // login; we don't want a duplicate key error.                                                  // 55
  OAuth._pendingCredentials.upsert({                                                              // 56
    key: key                                                                                      // 57
  }, {                                                                                            // 58
    key: key,                                                                                     // 59
    credential: credential,                                                                       // 60
    credentialSecret: credentialSecret || null,                                                   // 61
    createdAt: new Date()                                                                         // 62
  });                                                                                             // 63
};                                                                                                // 64
                                                                                                  // 65
                                                                                                  // 66
// Retrieves and removes a credential from the _pendingCredentials collection                     // 67
//                                                                                                // 68
// @param key {string}                                                                            // 69
// @param credentialSecret {string}                                                               // 70
//                                                                                                // 71
OAuth._retrievePendingCredential = function (key, credentialSecret) {                             // 72
  check(key, String);                                                                             // 73
                                                                                                  // 74
  var pendingCredential = OAuth._pendingCredentials.findOne({                                     // 75
    key: key,                                                                                     // 76
    credentialSecret: credentialSecret || null                                                    // 77
  });                                                                                             // 78
  if (pendingCredential) {                                                                        // 79
    OAuth._pendingCredentials.remove({ _id: pendingCredential._id });                             // 80
    if (pendingCredential.credential.error)                                                       // 81
      return recreateError(pendingCredential.credential.error);                                   // 82
    else                                                                                          // 83
      return OAuth.openSecret(pendingCredential.credential);                                      // 84
  } else {                                                                                        // 85
    return undefined;                                                                             // 86
  }                                                                                               // 87
};                                                                                                // 88
                                                                                                  // 89
                                                                                                  // 90
// Convert an Error into an object that can be stored in mongo                                    // 91
// Note: A Meteor.Error is reconstructed as a Meteor.Error                                        // 92
// All other error classes are reconstructed as a plain Error.                                    // 93
var storableError = function(error) {                                                             // 94
  var plainObject = {};                                                                           // 95
  Object.getOwnPropertyNames(error).forEach(function(key) {                                       // 96
    plainObject[key] = error[key];                                                                // 97
  });                                                                                             // 98
                                                                                                  // 99
  // Keep track of whether it's a Meteor.Error                                                    // 100
  if(error instanceof Meteor.Error) {                                                             // 101
    plainObject['meteorError'] = true;                                                            // 102
  }                                                                                               // 103
                                                                                                  // 104
  return { error: plainObject };                                                                  // 105
};                                                                                                // 106
                                                                                                  // 107
// Create an error from the error format stored in mongo                                          // 108
var recreateError = function(errorDoc) {                                                          // 109
  var error;                                                                                      // 110
                                                                                                  // 111
  if (errorDoc.meteorError) {                                                                     // 112
    error = new Meteor.Error();                                                                   // 113
    delete errorDoc.meteorError;                                                                  // 114
  } else {                                                                                        // 115
    error = new Error();                                                                          // 116
  }                                                                                               // 117
                                                                                                  // 118
  Object.getOwnPropertyNames(errorDoc).forEach(function(key) {                                    // 119
    error[key] = errorDoc[key];                                                                   // 120
  });                                                                                             // 121
                                                                                                  // 122
  return error;                                                                                   // 123
};                                                                                                // 124
                                                                                                  // 125
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////////////////////
//                                                                                                //
// packages/oauth/deprecated.js                                                                   //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
// XXX COMPAT WITH 0.8.0                                                                          // 1
                                                                                                  // 2
Oauth = OAuth;                                                                                    // 3
                                                                                                  // 4
////////////////////////////////////////////////////////////////////////////////////////////////////

}).call(this);
