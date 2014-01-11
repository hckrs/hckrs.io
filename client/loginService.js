

var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location', 'user_birthday', 'user_website', 'user_work_history' ] },
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

  // log
  GAnalytics.event("LoginService", "login", "automatically");
  
  checkDuplicateIdentity();
  checkInvitation();
  checkAccess();

  // if a redirectUrl is present, redirect to that url
  // otherwise if also no route is setted to the hackers list
  var redirectUrl = Session.get('redirectUrl');
  var currentRoute = Router._currentController.route.name;
  
  if (redirectUrl)
    Router.go(redirectUrl);
  else if(currentRoute === 'frontpage')
    Router.go('hackers');
  else
    Router.go(location.pathname + location.search + location.hash); //reload route

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

Template.main.events({
  "click #requestMergeDuplicateAccount .close": function() {
    Session.set('requestMergeDuplicateAccount', false);
  }
});
Handlebars.registerHelper('previousLoginSession', function() {
  return Session.get('previousLoginSession');
});
Handlebars.registerHelper('invitationLimitReached', function() {
  return Session.get('invitationLimitReached');
});
Handlebars.registerHelper('tellUsMore', function() {
  return Meteor.user().isIncompleteProfile;
});
Handlebars.registerHelper('isInvited', function() {
  return checkInvited();
});
Handlebars.registerHelper('isVerifiedEmail', function() {
  return verifiedEmail(); // user has minimal 1 verified email
});
Handlebars.registerHelper('isUnverifiedEmail', function() {
  return isUnverifiedEmail(); // user's added addresses are all unverified
});

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

  Session.set('previousLoginSession', previousSession);
  Session.set('requestMergeDuplicateAccount', requestMerge);
  
  // store the current login session in persistent browser storage, 
  // so we can check for duplicate idenity next time
  if (currentService) {
    amplify.store("previousLoginSession", {
      userId: Meteor.userId(),
      service: currentService
    });
  }
}

// when user isn't yet allowed to enter the site
// check if he has signed up with a valid invite code
var checkInvitation = function() {

  var phrase = Session.get('invitationPhrase');
  var broadcastUser = Session.get('invitationBroadcastUser');

  if (!checkInvited() && phrase) {
  
    // make a server call to check the invitation
    Meteor.call('verifyInvitation', phrase, function(err) {

      if (err && err.reason === 'limit') {

        // show invitation limit reached message
        Session.set('invitationLimitReached', true);
        Meteor.setTimeout(function() {
          Session.set('invitationLimitReached', false);
        }, 5 * 60 * 1000);
        
        // log to google analytics
        if (broadcastUser)
          GAnalytics.event('Invitations', 'limit reached for user', broadcastUser._id);
      
      } else if (err) {

        log("Error", err);

        // log to google analytics
        GAnalytics.event('Invitations', 'invalid phrase', phrase);
      
      } else { //on success

        setupSubscriptions(); //rerun subscriptions
        
        // log to google analytics
        if (broadcastUser)
          GAnalytics.event('Invitations', 'invited by user', broadcastUser._id);
      }

      // clean
      Session.set('invitationPhrase', null);
      Session.set('invitationBroadcastUser', null);

    });

  } else {

    // clean
    Session.set('invitationPhrase', null);
    Session.set('invitationBroadcastUser', null);
  }
};

// user let us know that he has filled in his profile
// check on server if this is correct
checkCompletedProfile = function() { /* GLOBAL, called from hacker.js */
  if (Meteor.user().isIncompleteProfile) {
    Meteor.call('requestProfileCompleted', function(err) {
      $(document).scrollTop(0);
      if (err) log(err);
      else {
        setupSubscriptions();
        Router.go('hackers');
      }
    });
  }
}

// new users have no access to the site until their profile is complete
// observe if the fields email and name are filled in, after saving
// also the user must have filled in a verified e-mailaddress
checkAccess = function() { /* GLOBAL, called from router.js */
  exec(function() {
    var user = Meteor.user();
    var profile = user.profile;
    if (user.isAccessDenied && !user.isIncompleteProfile && checkInvited() && verifiedEmail()) {
      Meteor.call('requestAccess', function(err) {
        $(document).scrollTop(0);
        if (err) log(err);
        else {
          setupSubscriptions();
          Router.go('hackers');
        }
      });
    }
  });
};

// check if user is invited
var checkInvited = function() { //GLOBAL, used in hacker.js
  return !!(Invitations.findOne({receivingUser: Meteor.userId()}) || Meteor.user().isMayor);
}

// check if user has some verified e-mailaddress
var verifiedEmail = function() { //GLOBAL, used in hacker.js
  var user = Meteor.user();
  return !!_.findWhere(user.emails, {address: user.profile.email, verified: true});
}

// check if user's added e-mail addresses are all unverified
var isUnverifiedEmail = function() {
  var emails = Meteor.user().emails || [];
  return emails.length && !verifiedEmail();
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

Handlebars.registerHelper('serviceLoginError', function() {
  return Session.get('serviceLoginError');
});

// after user tries to login, check if an error occured
var loginCallback = function(err) {
  if (err) {

    // log
    GAnalytics.event("LoginService", "login failure");

    // on error
    var message = "Something went wrong";
    
    // emailadres is in use by another user 
    if (err.reason === "duplicateEmail")
      message = "Try one of the other services!";

    Session.set('serviceLoginError', message);
    Meteor.setTimeout(function() { Session.set('serviceLoginError', false); }, 10000);
    log(err);
  
  } else {

    // on success
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

  // log
  GAnalytics.event("LoginService", "login", service);

  // set used service as cookie
  amplify.store('currentLoginService', service);

  // login
  Meteor["loginWith"+Service](options, loginCallback);
}

// log out the current user
var logout = function() {
  
  // log
  GAnalytics.event("LoginService", "logout");

  // first redirect to frontpage to make sure there are no helpers
  // active that making use of the user session information
  // this prevent from errors in the console
  Router.go('frontpage');

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
      if (err) {
        if (err.reason === "duplicateEmail") {
          // emailadres is in use by another user  
          Session.set('isAddServiceError_'+service, true);
          Meteor.setTimeout(function() { Session.set('isAddServiceError_'+service, false); }, 10000);
        } else {
          log(err);
        }

        // log
        GAnalytics.event("LoginService", "link failure", service);
      } else {
        // log
        GAnalytics.event("LoginService", "link service", service);
      }
    });       
  });
}

// remove an external service from user's account
var _removeService = function(service) {
  Meteor.call("removeServiceFromUser", service, function(err, res) {
    if (err)
      throw new Meteor.Error(500, err.reason);    
    else
      // log
      GAnalytics.event("LoginService", "unlink service", service);
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



