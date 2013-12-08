

var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location' /*, 'user_birthday'*/ ] },
  "github": { requestPermissions: [ 'user:email' /* XXX not working??? */ ] },
  "twitter": { requestPermissions: [ /* no permission available */ ] }
}




/* LOGIN EVENT handlers */

// when user is logged in by filling in its credentials
var manuallyLoggedIn = function() {
  /* do nothing */
}

// when user becomes logged in
var afterLogin = function() {
  
  checkDuplicateIdentity();
  checkInvitation();
  checkAccess();

  // if a redirectUrl is present, redirect to that url
  // otherwise if also no route is setted to the hackers list
  var redirectUrl = Session.get('redirectUrl');
  var currentRoute = Router._currentController.route.name;
  var useRoute = 'hackers'; //default

  if (redirectUrl)
    useRoute = redirectUrl;
  else if (currentRoute === 'frontpage')
    useRoute = currentRoute;
  
  Session.set('redirectUrl', null);
  Router.go(redirectUrl);
  
}

// when user becomes logged out
var afterLogout = function() {
  /* do nothing */
}

// when logging in is in progress
var loggingInInProgress = function() {
  /* do nothing */
}



/* ACCOUNT & ACCESS & INVITATIONS */

// check if there is an other existing user account
// that probably match the current user idenity
// we check that by using the browser persistent storage
var checkDuplicateIdentity = function() {

  var currentService = amplify.store('currentLoginService');
  var previousSession = amplify.store('previousLoginSession');
  
  var isRecentlyCreated = new Date().getTime() - Meteor.user().createdAt.getTime() < 2*60*1000; //5min
  var isOtherService = previousSession && previousSession.service != currentService;
  var isOtherAccount = previousSession && previousSession.userId != Meteor.userId();

  // when this is a new account (created in the last 2 minutes), then we check
  // if there are previously login session with an other account with different service
  // if so we notify the user that he has possible 2 account and we request to merge them
  var requestMerge = isRecentlyCreated && isOtherService && isOtherAccount;

  Session.set('requestMergeDuplicateAccount', requestMerge);
  Session.set('previousLoginSession', previousSession);
  
  // store the current login session in persistent browser storage, 
  // so we can check for duplicate idenity next time
  amplify.store("previousLoginSession", {
    userId: Meteor.userId(),
    service: currentService
  });
}

Handlebars.registerHelper('previousLoginSession', function() {
  return Session.get('previousLoginSession');
});

Template.main.events({
  "click #requestMergeDuplicateAccount .close": function() {
    Session.set('requestMergeDuplicateAccount', false);
  }
});


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
    Deps.autorun(function(c) {
      if (Session.equals('currentLoginState', 'loggedIn'))
        Deps.nonreactive(manuallyLoggedIn);
    });
  }
}

// login by using a external service
var loginWithService = function(event) {
  var $elm = $(event.currentTarget);
  var service = $elm.data('service');
  var options = serviceOptions[service];
  var Service = capitaliseFirstLetter(service);

  // set used service as cookie
  amplify.store('currentLoginService', service);

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

Template.main.events({
  "click .toggleService": toggleService
});



