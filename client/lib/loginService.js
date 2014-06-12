

var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location', 'user_birthday', 'user_website', 'user_work_history' ] },
  "github": { requestPermissions: [ 'user:email' /* XXX not working??? */ ] },
  "twitter": { requestPermissions: [ /* no permission available */ ] }
}


/* OBSERVE when user becomes logged in */

// continue check if login state changed
observeLoginState = function() {
  Meteor.setTimeout(function(){
    Meteor.autorun(function() {
      if (Meteor.userId()) {
        Deps.nonreactive(function() {
          afterLogin();
        });   
      }
    });
  }, 0);
}

// reset subscriptions
var resetSubscriptions = function() {
  Meteor.subscribe('publicUserDataCurrentUser');
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
 
  // subscibe to user information
  Meteor.subscribe('publicUserDataCurrentUser', Meteor.userId(), function() {

    checkAttachedToCity();
    checkDuplicateIdentity();
    checkInvitation();
    checkAccess();

    // if a redirectUrl is present, redirect to that url
    // otherwise if also no route is setted to the hackers list
    var redirectUrl = Session.get('redirectUrl');
    var currentRoute = Router.current().route.name;
    
    if (redirectUrl) {
      Session.set('redirectUrl', null);
      Router.go(redirectUrl);
    } else if(currentRoute === 'frontpage') {
      goToEntryPage();
    } else { // reload page to trigger route actions again
      Router.reload();
    }

  });
}

// when user becomes logged out
var afterLogout = function() {
  /* do nothing */
}

// which page should be loaded for logged in users which enter the site
goToEntryPage = function() {
  Router.go('highlights');
}



/* ACCOUNT & ACCESS & INVITATIONS */

Template.main.events({
  "click #requestMergeDuplicateAccount .close": function() {
    Session.set('requestMergeDuplicateAccount', false);
  }
});
UI.registerHelper('previousLoginSession', function() {
  return Session.get('previousLoginSession');
});
UI.registerHelper('invitationLimitReached', function() {
  return Session.get('invitationLimitReached');
});
UI.registerHelper('tellUsMore', function() {
  return Meteor.user().isIncompleteProfile;
});
UI.registerHelper('isInvited', function() {
  return checkInvited();
});
UI.registerHelper('isVerifiedEmail', function() {
  return verifiedEmail(); // user's profile email is verified
});
UI.registerHelper('isUnverifiedEmail', function() {
  return isUnverifiedEmail(); // user's profile email is not verified
});


// check if user is attached to a city
// if not, then we attach it to the current city
var checkAttachedToCity = function() {
  var city = Session.get('currentCity');
  if (!Meteor.user().city) {
    Meteor.call('attachUserToCity', city.key, function(err) {
      if (err) {
        Router.reload();
      } else {
        resetSubscriptions();
        goToEntryPage();
      }
    });
  }
}

// check if there is an other existing user account
// that probably match the current user idenity
// we check that by using the browser persistent storage
checkDuplicateIdentity = function() {

  var currentService = amplify.store('currentLoginService');
  var previousSession = amplify.store('previousLoginSession');
  
  var isRecentlyCreated = new Date().getTime() - Meteor.user().createdAt.getTime() < 2*60*1000; //5min
  var isOtherService = previousSession && currentService && previousSession.service != currentService;
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
checkInvitation = function() {

  var phrase = Session.get('invitationPhrase');
  var broadcastUser = Session.get('invitationBroadcastUser');

  if (!checkInvited() && phrase) {
  
    // make a server call to check the invitation
    Meteor.call('verifyInvitation', phrase, function(err) {

      if (err && err.reason === 'limit') {

        Router.reload();

        // show invitation limit reached message
        Session.set('invitationLimitReached', true);
        Meteor.setTimeout(function() {
          Session.set('invitationLimitReached', false);
        }, 5 * 60 * 1000);
        
        // log to google analytics
        if (broadcastUser)
          GAnalytics.event('Invitations', 'limit reached for user', broadcastUser._id);
      
      } else if (err) {

        Router.reload();

        log("Error", err);

        // log to google analytics
        GAnalytics.event('Invitations', 'invalid phrase', phrase);
      
      } else { //on success

        resetSubscriptions();
        goToEntryPage();
        
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
    exec(function() {
      Meteor.call('requestProfileCompleted', function(err) {
        if (err) {
          Router.reload();
          log(err);
        } else {
          resetSubscriptions();
          goToEntryPage();
        }
      });
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
        if (err) {
          Router.reload();
          log(err);
        } else {
          resetSubscriptions();
          goToEntryPage();
        }
      });
    }
  });
};

// check if user is invited
var checkInvited = function() { //GLOBAL, used in hacker.js
  return !Meteor.user().isUninvited;
}

// check if user's profile e-mail address is verified
var verifiedEmail = function() { //GLOBAL, used in hacker.js
  var user = Meteor.user();
  return !!_.findWhere(user.emails, {address: user.profile.email, verified: true});
}

// check if user's profile e-mail address is not verified
var isUnverifiedEmail = function() {
  return Meteor.user().profile.email && !verifiedEmail();
}










/* LOGIN functionality */

UI.registerHelper('serviceLoginError', function() {
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
    manuallyLoggedIn();
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
  Deps.flush();
  Meteor.setTimeout(function() {
    Meteor.logout(afterLogout); 
  }, 200);
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
var global = this;
var _addService = function(service, options, onSuccessCallback) {
  var Service = window[capitaliseFirstLetter(service)];
  
  // request a token from the external service
  Service.requestCredential(options, function(token, more) {
    var secret = OAuth._retrieveCredentialSecret(token);

    // send the token to our server-side method, which will handle 
    // updating the user with the new service information
    Meteor.call("addServiceToUser", token, secret, service, function(err, res) {
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
      } else { //success
        
        if(_.isFunction(onSuccessCallback))
          onSuccessCallback();
        
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
toggleService = function (event, onSuccessCallback) {
  var $elm = $(event.currentTarget);
  var service = $elm.data('service');
  var options = serviceOptions[service];
  var isLinked = !!Meteor.user().profile.social[service];

  isLinked ? _removeService(service) : _addService(service, options, onSuccessCallback);
}




