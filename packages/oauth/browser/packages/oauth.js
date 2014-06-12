(function () {

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/oauth/oauth_client.js                                                 //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
// credentialToken -> credentialSecret. You must provide both the                 // 1
// credentialToken and the credentialSecret to retrieve an access token from      // 2
// the _pendingCredentials collection.                                            // 3
var credentialSecrets = {};                                                       // 4
                                                                                  // 5
OAuth = {};                                                                       // 6
                                                                                  // 7
// Open a popup window, centered on the screen, and call a callback when it       // 8
// closes.                                                                        // 9
//                                                                                // 10
// @param url {String} url to show                                                // 11
// @param callback {Function} Callback function to call on completion. Takes no   // 12
//   arguments.                                                                   // 13
// @param dimensions {optional Object(width, height)} The dimensions of           // 14
//   the popup. If not passed defaults to something sane.                         // 15
OAuth.showPopup = function (url, callback, dimensions) {                          // 16
  // default dimensions that worked well for facebook and google                  // 17
  var popup = openCenteredPopup(                                                  // 18
    url,                                                                          // 19
    (dimensions && dimensions.width) || 650,                                      // 20
    (dimensions && dimensions.height) || 331                                      // 21
  );                                                                              // 22
                                                                                  // 23
  var checkPopupOpen = setInterval(function() {                                   // 24
    try {                                                                         // 25
      // Fix for #328 - added a second test criteria (popup.closed === undefined) // 26
      // to humour this Android quirk:                                            // 27
      // http://code.google.com/p/android/issues/detail?id=21061                  // 28
      var popupClosed = popup.closed || popup.closed === undefined;               // 29
    } catch (e) {                                                                 // 30
      // For some unknown reason, IE9 (and others?) sometimes (when               // 31
      // the popup closes too quickly?) throws "SCRIPT16386: No such              // 32
      // interface supported" when trying to read 'popup.closed'. Try             // 33
      // again in 100ms.                                                          // 34
      return;                                                                     // 35
    }                                                                             // 36
                                                                                  // 37
    if (popupClosed) {                                                            // 38
      clearInterval(checkPopupOpen);                                              // 39
      callback();                                                                 // 40
    }                                                                             // 41
  }, 100);                                                                        // 42
};                                                                                // 43
                                                                                  // 44
                                                                                  // 45
var openCenteredPopup = function(url, width, height) {                            // 46
  var screenX = typeof window.screenX !== 'undefined'                             // 47
        ? window.screenX : window.screenLeft;                                     // 48
  var screenY = typeof window.screenY !== 'undefined'                             // 49
        ? window.screenY : window.screenTop;                                      // 50
  var outerWidth = typeof window.outerWidth !== 'undefined'                       // 51
        ? window.outerWidth : document.body.clientWidth;                          // 52
  var outerHeight = typeof window.outerHeight !== 'undefined'                     // 53
        ? window.outerHeight : (document.body.clientHeight - 22);                 // 54
  // XXX what is the 22?                                                          // 55
                                                                                  // 56
  // Use `outerWidth - width` and `outerHeight - height` for help in              // 57
  // positioning the popup centered relative to the current window                // 58
  var left = screenX + (outerWidth - width) / 2;                                  // 59
  var top = screenY + (outerHeight - height) / 2;                                 // 60
  var features = ('width=' + width + ',height=' + height +                        // 61
                  ',left=' + left + ',top=' + top + ',scrollbars=yes');           // 62
                                                                                  // 63
  var newwindow = window.open(url, 'Login', features);                            // 64
  if (newwindow.focus)                                                            // 65
    newwindow.focus();                                                            // 66
  return newwindow;                                                               // 67
};                                                                                // 68
                                                                                  // 69
// XXX COMPAT WITH 0.7.0.1                                                        // 70
// Private interface but probably used by many oauth clients in atmosphere.       // 71
OAuth.initiateLogin = function (credentialToken, url, callback, dimensions) {     // 72
  OAuth.showPopup(                                                                // 73
    url,                                                                          // 74
    _.bind(callback, null, credentialToken),                                      // 75
    dimensions                                                                    // 76
  );                                                                              // 77
};                                                                                // 78
                                                                                  // 79
// Called by the popup when the OAuth flow is completed, right before             // 80
// the popup closes.                                                              // 81
OAuth._handleCredentialSecret = function (credentialToken, secret) {              // 82
  check(credentialToken, String);                                                 // 83
  check(secret, String);                                                          // 84
  if (! _.has(credentialSecrets,credentialToken)) {                               // 85
    credentialSecrets[credentialToken] = secret;                                  // 86
  } else {                                                                        // 87
    throw new Error("Duplicate credential token from OAuth login");               // 88
  }                                                                               // 89
};                                                                                // 90
                                                                                  // 91
// Used by accounts-oauth, which needs both a credentialToken and the             // 92
// corresponding to credential secret to call the `login` method over DDP.        // 93
OAuth._retrieveCredentialSecret = function (credentialToken) {                    // 94
  var secret = credentialSecrets[credentialToken];                                // 95
  delete credentialSecrets[credentialToken];                                      // 96
  return secret;                                                                  // 97
};                                                                                // 98
                                                                                  // 99
////////////////////////////////////////////////////////////////////////////////////

}).call(this);






(function () {

////////////////////////////////////////////////////////////////////////////////////
//                                                                                //
// packages/oauth/deprecated.js                                                   //
//                                                                                //
////////////////////////////////////////////////////////////////////////////////////
                                                                                  //
// XXX COMPAT WITH 0.8.0                                                          // 1
                                                                                  // 2
Oauth = OAuth;                                                                    // 3
                                                                                  // 4
////////////////////////////////////////////////////////////////////////////////////

}).call(this);
