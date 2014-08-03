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
OAuth._requestHandlers = {};                                                                      // 14
                                                                                                  // 15
                                                                                                  // 16
// Register a handler for an OAuth service. The handler will be called                            // 17
// when we get an incoming http request on /_oauth/{serviceName}. This                            // 18
// handler should use that information to fetch data about the user                               // 19
// logging in.                                                                                    // 20
//                                                                                                // 21
// @param name {String} e.g. "google", "facebook"                                                 // 22
// @param version {Number} OAuth version (1 or 2)                                                 // 23
// @param urls   For OAuth1 only, specify the service's urls                                      // 24
// @param handleOauthRequest {Function(oauthBinding|query)}                                       // 25
//   - (For OAuth1 only) oauthBinding {OAuth1Binding} bound to the appropriate provider           // 26
//   - (For OAuth2 only) query {Object} parameters passed in query string                         // 27
//   - return value is:                                                                           // 28
//     - {serviceData:, (optional options:)} where serviceData should end                         // 29
//       up in the user's services[name] field                                                    // 30
//     - `null` if the user declined to give permissions                                          // 31
//                                                                                                // 32
OAuth.registerService = function (name, version, urls, handleOauthRequest) {                      // 33
  if (registeredServices[name])                                                                   // 34
    throw new Error("Already registered the " + name + " OAuth service");                         // 35
                                                                                                  // 36
  registeredServices[name] = {                                                                    // 37
    serviceName: name,                                                                            // 38
    version: version,                                                                             // 39
    urls: urls,                                                                                   // 40
    handleOauthRequest: handleOauthRequest                                                        // 41
  };                                                                                              // 42
};                                                                                                // 43
                                                                                                  // 44
// For test cleanup.                                                                              // 45
OAuthTest.unregisterService = function (name) {                                                   // 46
  delete registeredServices[name];                                                                // 47
};                                                                                                // 48
                                                                                                  // 49
                                                                                                  // 50
OAuth.retrieveCredential = function(credentialToken, credentialSecret) {                          // 51
  return OAuth._retrievePendingCredential(credentialToken, credentialSecret);                     // 52
};                                                                                                // 53
                                                                                                  // 54
                                                                                                  // 55
// Listen to incoming OAuth http requests                                                         // 56
WebApp.connectHandlers.use(function(req, res, next) {                                             // 57
  // Need to create a Fiber since we're using synchronous http calls and nothing                  // 58
  // else is wrapping this in a fiber automatically                                               // 59
  Fiber(function () {                                                                             // 60
    middleware(req, res, next);                                                                   // 61
  }).run();                                                                                       // 62
});                                                                                               // 63
                                                                                                  // 64
middleware = function (req, res, next) {                                                          // 65
  // Make sure to catch any exceptions because otherwise we'd crash                               // 66
  // the runner                                                                                   // 67
  try {                                                                                           // 68
    var serviceName = oauthServiceName(req);                                                      // 69
    if (!serviceName) {                                                                           // 70
      // not an oauth request. pass to next middleware.                                           // 71
      next();                                                                                     // 72
      return;                                                                                     // 73
    }                                                                                             // 74
                                                                                                  // 75
    var service = registeredServices[serviceName];                                                // 76
                                                                                                  // 77
    // Skip everything if there's no service set by the oauth middleware                          // 78
    if (!service)                                                                                 // 79
      throw new Error("Unexpected OAuth service " + serviceName);                                 // 80
                                                                                                  // 81
    // Make sure we're configured                                                                 // 82
    ensureConfigured(serviceName);                                                                // 83
                                                                                                  // 84
    var handler = OAuth._requestHandlers[service.version];                                        // 85
    if (!handler)                                                                                 // 86
      throw new Error("Unexpected OAuth version " + service.version);                             // 87
    handler(service, req.query, res);                                                             // 88
  } catch (err) {                                                                                 // 89
    // if we got thrown an error, save it off, it will get passed to                              // 90
    // the appropriate login call (if any) and reported there.                                    // 91
    //                                                                                            // 92
    // The other option would be to display it in the popup tab that                              // 93
    // is still open at this point, ignoring the 'close' or 'redirect'                            // 94
    // we were passed. But then the developer wouldn't be able to                                 // 95
    // style the error or react to it in any way.                                                 // 96
    if (req.query.state && err instanceof Error) {                                                // 97
      try { // catch any exceptions to avoid crashing runner                                      // 98
        OAuth._storePendingCredential(req.query.state, err);                                      // 99
      } catch (err) {                                                                             // 100
        // Ignore the error and just give up. If we failed to store the                           // 101
        // error, then the login will just fail with a generic error.                             // 102
        Log.warn("Error in OAuth Server while storing pending login result.\n" +                  // 103
                 err.stack || err.message);                                                       // 104
      }                                                                                           // 105
    }                                                                                             // 106
                                                                                                  // 107
    // close the popup. because nobody likes them just hanging                                    // 108
    // there.  when someone sees this multiple times they might                                   // 109
    // think to check server logs (we hope?)                                                      // 110
    OAuth._endOfLoginResponse(res, {                                                              // 111
      query: req.query,                                                                           // 112
      error: err                                                                                  // 113
    });                                                                                           // 114
  }                                                                                               // 115
};                                                                                                // 116
                                                                                                  // 117
OAuthTest.middleware = middleware;                                                                // 118
                                                                                                  // 119
// Handle /_oauth/* paths and extract the service name.                                           // 120
//                                                                                                // 121
// @returns {String|null} e.g. "facebook", or null if this isn't an                               // 122
// oauth request                                                                                  // 123
var oauthServiceName = function (req) {                                                           // 124
  // req.url will be "/_oauth/<service name>?<action>"                                            // 125
  var barePath = req.url.substring(0, req.url.indexOf('?'));                                      // 126
  var splitPath = barePath.split('/');                                                            // 127
                                                                                                  // 128
  // Any non-oauth request will continue down the default                                         // 129
  // middlewares.                                                                                 // 130
  if (splitPath[1] !== '_oauth')                                                                  // 131
    return null;                                                                                  // 132
                                                                                                  // 133
  // Find service based on url                                                                    // 134
  var serviceName = splitPath[2];                                                                 // 135
  return serviceName;                                                                             // 136
};                                                                                                // 137
                                                                                                  // 138
// Make sure we're configured                                                                     // 139
var ensureConfigured = function(serviceName) {                                                    // 140
  if (!ServiceConfiguration.configurations.findOne({service: serviceName})) {                     // 141
    throw new ServiceConfiguration.ConfigError();                                                 // 142
  }                                                                                               // 143
};                                                                                                // 144
                                                                                                  // 145
var isSafe = function (value) {                                                                   // 146
  // This matches strings generated by `Random.secret` and                                        // 147
  // `Random.id`.                                                                                 // 148
  return typeof value === "string" &&                                                             // 149
    /^[a-zA-Z0-9\-_]+$/.test(value);                                                              // 150
};                                                                                                // 151
                                                                                                  // 152
// Internal: used by the oauth1 and oauth2 packages                                               // 153
OAuth._renderOauthResults = function(res, query, credentialSecret) {                              // 154
  // We expect the ?close parameter to be present, in which case we                               // 155
  // close the popup at the end of the OAuth flow. Any other query                                // 156
  // string should just serve a blank page. For tests, we support the                             // 157
  // `only_credential_secret_for_test` parameter, which just returns the                          // 158
  // credential secret without any surrounding HTML. (The test needs to                           // 159
  // be able to easily grab the secret and use it to log in.)                                     // 160
  //                                                                                              // 161
  // XXX only_credential_secret_for_test could be useful for other                                // 162
  // things beside tests, like command-line clients. We should give it a                          // 163
  // real name and serve the credential secret in JSON.                                           // 164
  if (query.only_credential_secret_for_test) {                                                    // 165
    res.writeHead(200, {'Content-Type': 'text/html'});                                            // 166
    res.end(credentialSecret, 'utf-8');                                                           // 167
  } else {                                                                                        // 168
    var details = { query: query };                                                               // 169
    if (query.error) {                                                                            // 170
      details.error = query.error;                                                                // 171
    } else {                                                                                      // 172
      var token = query.state;                                                                    // 173
      var secret = credentialSecret;                                                              // 174
      if (token && secret &&                                                                      // 175
          isSafe(token) && isSafe(secret)) {                                                      // 176
        details.credentials = { token: token, secret: secret};                                    // 177
      } else {                                                                                    // 178
        details.error = "invalid_credential_token_or_secret";                                     // 179
      }                                                                                           // 180
    }                                                                                             // 181
                                                                                                  // 182
    OAuth._endOfLoginResponse(res, details);                                                      // 183
  }                                                                                               // 184
};                                                                                                // 185
                                                                                                  // 186
// This "template" (not a real Spacebars template, just an HTML file                              // 187
// with some ##PLACEHOLDER##s) communicates the credential secret back                            // 188
// to the main window and then closes the popup.                                                  // 189
OAuth._endOfLoginResponseTemplate = Assets.getText(                                               // 190
  "end_of_login_response.html");                                                                  // 191
                                                                                                  // 192
// Renders `endOfLoginResponseTemplate` into some HTML and JavaScript                             // 193
// that closes the popup at the end of the OAuth flow.                                            // 194
OAuth._renderEndOfLoginResponse = function (setCredentialToken, token, secret) {                  // 195
  // It would be nice to use Blaze here, but it's a little tricky                                 // 196
  // because our mustaches would be inside a <script> tag, and Blaze                              // 197
  // would treat the <script> tag contents as text (e.g. encode '&' as                            // 198
  // '&amp;'). So we just do a simple replace.                                                    // 199
  var result = OAuth._endOfLoginResponseTemplate.replace(                                         // 200
      /##SET_CREDENTIAL_TOKEN##/, JSON.stringify(setCredentialToken));                            // 201
  result = result.replace(/##DOMAIN##/,Npm.require("url").parse(Meteor.absoluteUrl()).hostname);  // 202
  result = result.replace(                                                                        // 203
    /##TOKEN##/, JSON.stringify(token));                                                          // 204
  result = result.replace(                                                                        // 205
    /##SECRET##/, JSON.stringify(secret));                                                        // 206
  result = result.replace(                                                                        // 207
    /##LOCAL_STORAGE_PREFIX##/,                                                                   // 208
    JSON.stringify(OAuth._localStorageTokenPrefix));                                              // 209
                                                                                                  // 210
  return "<!DOCTYPE html>\n" + result;                                                            // 211
};                                                                                                // 212
                                                                                                  // 213
// Writes an HTTP response to the popup window at the end of an OAuth                             // 214
// login flow. At this point, if the user has successfully authenticated                          // 215
// to the OAuth server and authorized this app, we communicate the                                // 216
// credentialToken and credentialSecret to the main window. The main                              // 217
// window must provide both these values to the DDP `login` method to                             // 218
// authenticate its DDP connection. After communicating these vaues to                            // 219
// the main window, we close the popup.                                                           // 220
//                                                                                                // 221
// We export this function so that developers can override this                                   // 222
// behavior, which is particularly useful in, for example, some mobile                            // 223
// environments where popups and/or `window.opener` don't work. For                               // 224
// example, an app could override `OAuth._endOfLoginResponse` to put the                          // 225
// credential token and credential secret in the popup URL for the main                           // 226
// window to read them there instead of using `window.opener`. If you                             // 227
// override this function, you take responsibility for writing to the                             // 228
// request and calling `res.end()` to complete the request.                                       // 229
//                                                                                                // 230
// Arguments:                                                                                     // 231
//   - res: the HTTP response object                                                              // 232
//   - details:                                                                                   // 233
//      - query: the query string on the HTTP request                                             // 234
//      - credentials: { token: *, secret: * }. If present, this field                            // 235
//        indicates that the login was successful. Return these values                            // 236
//        to the client, who can use them to log in over DDP. If                                  // 237
//        present, the values have been checked against a limited                                 // 238
//        character set and are safe to include in HTML.                                          // 239
//      - error: if present, a string or Error indicating an error that                           // 240
//        occurred during the login. This can come from the client and                            // 241
//        so shouldn't be trusted for security decisions or included in                           // 242
//        the response without sanitizing it first. Only one of `error`                           // 243
//        or `credentials` should be set.                                                         // 244
OAuth._endOfLoginResponse = function (res, details) {                                             // 245
                                                                                                  // 246
  res.writeHead(200, {'Content-Type': 'text/html'});                                              // 247
                                                                                                  // 248
  if (details.error) {                                                                            // 249
    Log.warn("Error in OAuth Server: " +                                                          // 250
             (details.error instanceof Error ?                                                    // 251
              details.error.message : details.error));                                            // 252
    res.end(OAuth._renderEndOfLoginResponse(false), "utf-8");                                     // 253
    return;                                                                                       // 254
  }                                                                                               // 255
                                                                                                  // 256
  if ("close" in details.query) {                                                                 // 257
    // If we have a credentialSecret, report it back to the parent                                // 258
    // window, with the corresponding credentialToken. The parent window                          // 259
    // uses the credentialToken and credentialSecret to log in over DDP.                          // 260
    res.end(OAuth._renderEndOfLoginResponse(true,                                                 // 261
                                            details.credentials.token,                            // 262
                                            details.credentials.secret),                          // 263
            "utf-8");                                                                             // 264
  } else {                                                                                        // 265
    res.end("", "utf-8");                                                                         // 266
  }                                                                                               // 267
};                                                                                                // 268
                                                                                                  // 269
                                                                                                  // 270
var OAuthEncryption = Package["oauth-encryption"] && Package["oauth-encryption"].OAuthEncryption; // 271
                                                                                                  // 272
var usingOAuthEncryption = function () {                                                          // 273
  return OAuthEncryption && OAuthEncryption.keyIsLoaded();                                        // 274
};                                                                                                // 275
                                                                                                  // 276
// Encrypt sensitive service data such as access tokens if the                                    // 277
// "oauth-encryption" package is loaded and the oauth secret key has                              // 278
// been specified.  Returns the unencrypted plaintext otherwise.                                  // 279
//                                                                                                // 280
// The user id is not specified because the user isn't known yet at                               // 281
// this point in the oauth authentication process.  After the oauth                               // 282
// authentication process completes the encrypted service data fields                             // 283
// will be re-encrypted with the user id included before inserting the                            // 284
// service data into the user document.                                                           // 285
//                                                                                                // 286
OAuth.sealSecret = function (plaintext) {                                                         // 287
  if (usingOAuthEncryption())                                                                     // 288
    return OAuthEncryption.seal(plaintext);                                                       // 289
  else                                                                                            // 290
    return plaintext;                                                                             // 291
}                                                                                                 // 292
                                                                                                  // 293
// Unencrypt a service data field, if the "oauth-encryption"                                      // 294
// package is loaded and the field is encrypted.                                                  // 295
//                                                                                                // 296
// Throws an error if the "oauth-encryption" package is loaded and the                            // 297
// field is encrypted, but the oauth secret key hasn't been specified.                            // 298
//                                                                                                // 299
OAuth.openSecret = function (maybeSecret, userId) {                                               // 300
  if (!Package["oauth-encryption"] || !OAuthEncryption.isSealed(maybeSecret))                     // 301
    return maybeSecret;                                                                           // 302
                                                                                                  // 303
  return OAuthEncryption.open(maybeSecret, userId);                                               // 304
};                                                                                                // 305
                                                                                                  // 306
// Unencrypt fields in the service data object.                                                   // 307
//                                                                                                // 308
OAuth.openSecrets = function (serviceData, userId) {                                              // 309
  var result = {};                                                                                // 310
  _.each(_.keys(serviceData), function (key) {                                                    // 311
    result[key] = OAuth.openSecret(serviceData[key], userId);                                     // 312
  });                                                                                             // 313
  return result;                                                                                  // 314
};                                                                                                // 315
                                                                                                  // 316
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
// packages/oauth/oauth_common.js                                                                 //
//                                                                                                //
////////////////////////////////////////////////////////////////////////////////////////////////////
                                                                                                  //
OAuth._localStorageTokenPrefix = "Meteor.oauth.";                                                 // 1
                                                                                                  // 2
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
