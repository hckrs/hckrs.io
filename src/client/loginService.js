Session.setDefault('currentLoginState', 'loggedOut');
Session.setDefault('subscriptionsReady', true); //XXX TODO: set to false when using subscriptions



var facebookOptions = { requestPermissions: [ 'email', 'user_birthday' /* XXX birthday not given by meteor? */ ] };
var githubOptions = { requestPermissions: [ 'user:email' /* XXX not working??? */ ] };
var twitterOptions = { requestPermissions: [ /* no permission available */ ] };


/* LOGIN EVENT handlers */

// when user is logged in by filling in its credentials
var manuallyLoggedIn = function() {
  log('manually logged IN')
}

// when user becomes logged in
var afterLogin = function() {
  log('becomes logged IN')
  if (Router._currentController.route.name == 'frontpage')
    Router.go('hackers');
}

// when user becomes logged out
var afterLogout = function() {
  log('becomes logged OUT')
  // Router.go('frontpage');
}

// when logging in is in progress
var loggingInInProgress = function() {
  log('signing in....')
}




/* OBSERVE when user becomes logged in */

// observer changes of the current login state
var loginStateChanges = function(c) {
  var state = Session.get('currentLoginState');
  if (c.firstRun) return;
  switch(state) {
    case 'loggedIn': afterLogin(); break;
    case 'loggingIn': loggingInInProgress(); break;
    case 'loggedOut': afterLogout(); break;
  }
}

// keep updating the currentLoginState when user is loggin in or out
var updateLoginState = function() {
  if (Meteor.userId() && Session.get('subscriptionsReady'))
    Session.set('currentLoginState', 'loggedIn');
  else if (Meteor.loggingIn() || (Meteor.userId() && !Session.get('subscriptionsReady')))
    Session.set('currentLoginState', 'loggingIn');
  else 
    Session.set('currentLoginState', 'loggedOut');
}

// keep track of the login session
Meteor.startup(function() {
  Deps.autorun(loginStateChanges);
  Deps.autorun(updateLoginState);
});




/* LOGIN functionality */

// after user tries to login, check if an error occured
var loginCallback = function(err) {
  if (err) {
    // XXX TODO: handle the case when login fails
  } else {
    manuallyLoggedIn();
  }
}

// login by using a external service
var loginWithFacebook = function() { Meteor.loginWithFacebook(facebookOptions, loginCallback); }
var loginWithGithub = function() { Meteor.loginWithGithub(githubOptions, loginCallback); }
var loginWithTwitter = function() { Meteor.loginWithTwitter(twitterOptions, loginCallback); }

// log out the current user
var logout = function() { 
  Meteor.logout(); 
}


// bind the sign up buttons to the corresponding actions
Template.frontpage.events({
  "click #signupWithFacebook": loginWithFacebook,
  "click #signupWithGithub":   loginWithGithub,
  "click #signupWithTwitter":  loginWithTwitter
});

// bind the sign out button to the sign out action
Template.header.events({
  "click #signOutButton": logout
});



/* ADD SERVICES to my profile */

// add an external service to current user's account
var addService = function(service, Service, options) {

  // request a token from the external service
  Service.requestCredential(options, function(token) {

    // send the token to our server-side method, which will handle 
    // updating the user with the new service information
    Meteor.call("addServiceToUser", token, service, function(err, res) {
      if (err) throw new Meteor.Error(500, err.reason);    
    });       
  });
}

// adding one of the external services to user's account
var addFacebook = function() { addService('facebook', Facebook, facebookOptions); }
var addGithub = function() { addService('github', Github, githubOptions); }
var addTwitter = function() { addService('twitter', Twitter, twitterOptions); }

Template.hacker.events({
  "click #addFacebookButton": addFacebook,
  "click #addGithubButton":   addGithub,
  "click #addTwitterButton":  addTwitter
});




/* TESTING */

// activate test button
var TESTING_ON = false; 

// test something when clicked on the "test something" button
test = function() {
  Meteor.call("oauth", "twitter", "GET", "https://api.twitter.com/1.1/account/verify_credentials.json", {}, function(err, res) {
    if (err) throw new Meteor.Error(500, err.reason); 
    else console.log(res);
  });
}

// insert test button when page is loaded that can trigger the test function
Meteor.startup(function() {
  if (TESTING_ON) {
    $button = $('<button class="btn">TEST something</button>');
    $button.css({position: 'absolute', bottom: 0, left: 0, zIndex: 999});
    $button.click(test);
    $("body").prepend($button)
  }
});
