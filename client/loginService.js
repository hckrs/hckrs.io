

var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location' /*, 'user_birthday'*/ ] },
  "github": { requestPermissions: [ 'user:email' /* XXX not working??? */ ] },
  "twitter": { requestPermissions: [ /* no permission available */ ] }
}




/* LOGIN EVENT handlers */

// when user is logged in by filling in its credentials
var manuallyLoggedIn = function() {
  /* do nothing */
  /* no certainty that subscriptions are ready here */
}

// when user becomes logged in
var afterLogin = function() {
  
  checkInvitation();
  checkAccess();

  var route = Router._currentController.route.name; //current route

  // if no route is setted, go to hackers list after login
  if (route == 'frontpage')
    Router.go('hackers');
}

// when user becomes logged out
var afterLogout = function() {
  Router.go('frontpage');
}

// when logging in is in progress
var loggingInInProgress = function() {
  /* do nothing */
}



/* ACCESS & INVITATIONS */

// when user isn't yet allowed to enter the site
// check if he has signed up with a valid invite code
var checkInvitation = function() {
  
  if (Meteor.user() && !Meteor.user().isInvited && Session.get('invitationCode')) {
    // make a server call to check the invitation
    Meteor.call('verifyInvitationCode', Session.get('invitationCode'), function(err) {
      if (err) log("Error", err)
      else setupSubscriptions() //rerun subscriptions
    });
  } 
};

// new users have no access to the site until their profile is complete
// observe if the fields email and name are filled in, after saving
checkAccess = function() { /* GLOBAL, called from hacker.js */
  exec(function() {
    var user = Meteor.user();
    var profile = user.profile;
    if (!user.allowAccess && user.isInvited && profile.email && profile.name)
      Meteor.call('requestAccess', function(err) {
        if (err) log(err);
        else setupSubscriptions();
      });
  });
};


/* OBSERVE when user becomes logged in */

// handle actions when login state is changed
var loginStateHandler = function(c) {
  var state = Session.get('currentLoginState');
  if (c.firstRun) return;
  Deps.nonreactive(function() {
    switch(state) {
      case 'loggedIn': afterLogin(); break;
      case 'loggingIn': loggingInInProgress(); break;
      case 'loggedOut': afterLogout(); break;
    }
  });
}

// keep updating the currentLoginState when user is loggin in or out
var observeLoginState = function() {
  if (Meteor.user() && Session.get('userSubscriptionsReady')) // logged in and rady
    Session.set('currentLoginState', 'loggedIn'); 
  else if (Meteor.user()) // logged in but wait to subscriptions are reloaded
    setupSubscriptions();
  else if (Meteor.loggingIn()) // meteor is busy with logging in the user
    Session.set('currentLoginState', 'loggingIn');
  else // user is logged out
    Session.set('currentLoginState', 'loggedOut');
}

// keep track of the login session
Meteor.startup(function() {
  Session.set('currentLoginState', 'loggedOut');
  Session.set('subscriptionsReady', false);
  Session.set('userSubscriptionsReady', false);
  setupSubscriptions();
  Deps.autorun(loginStateHandler);
  Deps.autorun(observeLoginState);
});


/* SUBSCRIPTIONS */


var setupSubscriptions = function() {

  var subscribeTo = ['invitations', 'publicUserDataCurrentUser', 'publicUserDataEmail', 'publicUserData'];

  // reset subscriptions ready
  Session.set('subscriptionsReady', false);
  Session.set('userSubscriptionsReady', false);
  
  // mark subscriptions as ready when they are completely loaded
  var callback = _.after(subscribeTo.length, function() {
    Session.set('subscriptionsReady', true);
    if (Meteor.user()) // XXX can we assume that Meteor.user() is always setted at this point?
      Session.set('userSubscriptionsReady', true);
  });

  // this unique hash makes it sure that all subscriptions rerun 
  // when this method "setupSubscriptions" called again
  var hash = Random.id();
  
  // subscribe to collections
  _.each(subscribeTo, function(collection) {
    Meteor.subscribe(collection, hash, callback);
  });

  if (subscribeTo.length === 0)
    callback();
}



/* LOGIN functionality */

// after user tries to login, check if an error occured
var loginCallback = function(err) {
  if (err) {
    // XXX TODO: handle the case when login fails
    log("Error", err);
  } else {
    manuallyLoggedIn();
  }
}

// login by using a external service
var loginWithService = function(event) {
  var $elm = $(event.currentTarget);
  var service = $elm.data('service');
  var options = serviceOptions[service];
  var Service = capitaliseFirstLetter(service);

  // login
  Meteor["loginWith"+Service](options, loginCallback);
}

// log out the current user
var logout = function() { 
  Meteor.logout(); 
}


// bind the sign up buttons to the corresponding actions
Template.main.events({
  "click .signupService": loginWithService
});

// bind the sign out button to the sign out action
Template.main.events({
  "click #signOutButton": logout
});





/* ADD SERVICES to my profile */

// add an external service to current user's account
var _addService = function(service, options) {
  var Service = window[capitaliseFirstLetter(service)];
  
  // request a token from the external service
  Service.requestCredential(options, function(token) {

    // send the token to our server-side method, which will handle 
    // updating the user with the new service information
    Meteor.call("addServiceToUser", token, service, function(err, res) {
      if (err) throw new Meteor.Error(500, err.reason);    
    });       
  });
}

// remove an external service from user's account
var _removeService = function(service) {
  Meteor.call("removeServiceFromUser", service, function(err, res) {
    if (err) throw new Meteor.Error(500, err.reason);    
  });  
}

// user toggles an external service
// add or remove the service from user's account
var toggleService = function (event) {
  var $elm = $(event.currentTarget);
  var service = $elm.data('service');
  var options = serviceOptions[service];
  var isLinked = !!Meteor.user().profile.social[service];

  isLinked ? _removeService(service) : _addService(service, options);
}

Template.hacker.events({
  "click .toggleService": toggleService
});




