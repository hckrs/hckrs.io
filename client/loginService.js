

var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location' /*, 'user_birthday'*/ ] },
  "github": { requestPermissions: [ 'user:email' /* XXX not working??? */ ] },
  "twitter": { requestPermissions: [ /* no permission available */ ] }
}


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
  /* no certainty that subscriptions are ready here */
}

// when user becomes logged in
var afterLogin = function() {
  var route = Router._currentController.route.name; //current route

  // when user isn't yet allowed to enter the site
  // check if he has signed up with a valid invite code
  if (Meteor.user() && !Meteor.user().allowAccess && Session.get('invitationCode')) {
  
    // make a server call to check the invitation
    Meteor.call('verifyInvitationCode', Session.get('invitationCode'), function(err) {
      if (err) log("Error", err)
      else setupSubscriptions() //rerun subscriptions
    });
  }
  
  // if no route path is specified in the url: 
  // A. redirect to user's profile when the information is incomplete
  // B. redirect to the hackers list otherwise
  if (route == 'frontpage') {
    if (!isUserProfileComplete())
      Router.go('hacker', Meteor.user());
    else 
      Router.go('hackers');
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




