(function () {

//////////////////////////////////////////////////////////////////////////////////////
//                                                                                  //
// packages/oauth/oauth_tests.js                                                    //
//                                                                                  //
//////////////////////////////////////////////////////////////////////////////////////
                                                                                    //
Tinytest.add("oauth - pendingCredential handles Errors", function (test) {          // 1
  var credentialToken = Random.id();                                                // 2
                                                                                    // 3
  var testError = new Error("This is a test error");                                // 4
  testError.stack = 'test stack';                                                   // 5
  OAuth._storePendingCredential(credentialToken, testError);                        // 6
                                                                                    // 7
  // Test that the result for the token is the expected error                       // 8
  var result = OAuth._retrievePendingCredential(credentialToken);                   // 9
  test.instanceOf(result, Error);                                                   // 10
  test.equal(result.message, testError.message);                                    // 11
  test.equal(result.stack, testError.stack);                                        // 12
});                                                                                 // 13
                                                                                    // 14
Tinytest.add("oauth - pendingCredential handles Meteor.Errors", function (test) {   // 15
  var credentialToken = Random.id();                                                // 16
                                                                                    // 17
  var testError = new Meteor.Error(401, "This is a test error");                    // 18
  testError.stack = 'test stack';                                                   // 19
  OAuth._storePendingCredential(credentialToken, testError);                        // 20
                                                                                    // 21
  // Test that the result for the token is the expected error                       // 22
  var result = OAuth._retrievePendingCredential(credentialToken);                   // 23
  test.instanceOf(result, Meteor.Error);                                            // 24
  test.equal(result.error, testError.error);                                        // 25
  test.equal(result.message, testError.message);                                    // 26
  test.equal(result.reason, testError.reason);                                      // 27
  test.equal(result.stack, testError.stack);                                        // 28
  test.isUndefined(result.meteorError);                                             // 29
});                                                                                 // 30
                                                                                    // 31
Tinytest.add("oauth - null, undefined key for pendingCredential", function (test) { // 32
  var cred = Random.id();                                                           // 33
  test.throws(function () {                                                         // 34
    OAuth._storePendingCredential(null, cred);                                      // 35
  });                                                                               // 36
  test.throws(function () {                                                         // 37
    OAuth._storePendingCredential(undefined, cred);                                 // 38
  });                                                                               // 39
});                                                                                 // 40
                                                                                    // 41
Tinytest.add("oauth - pendingCredential handles duplicate key", function (test) {   // 42
  var key = Random.id();                                                            // 43
  var cred = Random.id();                                                           // 44
  OAuth._storePendingCredential(key, cred);                                         // 45
  var newCred = Random.id();                                                        // 46
  OAuth._storePendingCredential(key, newCred);                                      // 47
  test.equal(OAuth._retrievePendingCredential(key), newCred);                       // 48
});                                                                                 // 49
                                                                                    // 50
Tinytest.add(                                                                       // 51
  "oauth - pendingCredential requires credential secret",                           // 52
  function (test) {                                                                 // 53
    var key = Random.id();                                                          // 54
    var cred = Random.id();                                                         // 55
    var secret = Random.id();                                                       // 56
    OAuth._storePendingCredential(key, cred, secret);                               // 57
    test.equal(OAuth._retrievePendingCredential(key), undefined);                   // 58
    test.equal(OAuth._retrievePendingCredential(key, secret), cred);                // 59
  }                                                                                 // 60
);                                                                                  // 61
                                                                                    // 62
//////////////////////////////////////////////////////////////////////////////////////

}).call(this);
