
var facebookOptions = { requestPermissions: [ 'email', 'user_location' /*, 'user_birthday'*/ ] };
var githubOptions = { requestPermissions: [ 'user:email' /* XXX not working??? */ ] };
var twitterOptions = { requestPermissions: [ /* no permission available */ ] };



// check if user's profile information is complete
var isUserProfileComplete = function() {
  var requiredFields = ['name', 'email', 'address'];
  var user = Meteor.users.findOne(Meteor.userId(), {reactive: false});
  if (!user) return false;
  var userFields = _.pick(user.profile, requiredFields);
  return _.size(userFields) == requiredFields.length && _.every(userFields, _.identity);
}



/* LOGIN EVENT handlers */

// when user is logged in by filling in its credentials
var manuallyLoggedIn = function() {
  /* do nothing */
}

// when user becomes logged in
var afterLogin = function() {
  var route = Router._currentController.route.name; //current route
  var noRoute = route == 'frontpage';
  
  if (noRoute) {
    // if no route path is specified in the url: 
    // A. redirect to user's profile when the information is incomplete
    // B. redirect to the hackers list otherwise
    if (!isUserProfileComplete())
      Router.go('hacker', {_id: Meteor.userId()});
    else 
      Router.go('hackers');
  } else {
    // if there is a route path specified in the url
    // show the corresponding page
  }
}

// when user becomes logged out
var afterLogout = function() {
  Router.go('frontpage');
}

// when logging in is in progress
var loggingInInProgress = function() {
  /* do nothing */
}




/* OBSERVE when user becomes logged in */

// handle actions when login state is changed
var loginStateHandler = function(c) {
  var state = Session.get('currentLoginState');
  if (c.firstRun) return;
  switch(state) {
    case 'loggedIn': afterLogin(); break;
    case 'loggingIn': loggingInInProgress(); break;
    case 'loggedOut': afterLogout(); break;
  }
}

// keep updating the currentLoginState when user is loggin in or out
var observeLoginState = function() {
  if (Meteor.userId() && Session.get('subscriptionsReady')) // logged in and rady
    Session.set('currentLoginState', 'loggedIn');
  else if (Meteor.userId()) // logged in but subscriptions arn't ready yet
    setupPrivateSubscriptions();
  else if (Meteor.loggingIn()) // meteor is busy with logging in the user
    Session.set('currentLoginState', 'loggingIn');
  else // user is logged out
    Session.set('currentLoginState', 'loggedOut');
}

// keep track of the login session
Meteor.startup(function() {
  Session.set('currentLoginState', 'loggedOut');
  Session.set('subscriptionsReady', false);
  setupPublicSubscriptions();
  Deps.autorun(loginStateHandler);
  Deps.autorun(observeLoginState);
});


/* SUBSCRIPTIONS */

var setupPublicSubscriptions = function() {

  var subscribeTo = ['userData'];
  
  // subscribe to collections
  _.each(subscribeTo, function(collection) {
    Meteor.subscribe(collection);
  });
}

var setupPrivateSubscriptions = function() {

  var subscribeTo = [];
  
  // mark subscriptions as ready when they are completely loaded
  var callback = _.after(subscribeTo.length, function() {
    Session.set('subscriptionsReady', true);
  });

  // subscribe to collections
  _.each(subscribeTo, function(collection) {
    Meteor.subscribe(collection, callback);
  });

  if (subscribeTo.length === 0)
    callback();
}


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
Template.main.events({
  "click #signupWithFacebook": loginWithFacebook,
  "click #signupWithGithub":   loginWithGithub,
  "click #signupWithTwitter":  loginWithTwitter
});

// bind the sign out button to the sign out action
Template.main.events({
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




