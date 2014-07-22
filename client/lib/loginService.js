Login = {};


var serviceOptions = {
  "facebook": { requestPermissions: [ 'email', 'user_location', 'user_birthday', 'user_website', 'user_work_history' ] },
  "github": { requestPermissions: [ 'user:email' /* XXX not working??? */ ] },
  "twitter": { requestPermissions: [ /* no permission available */ ] }
}



Login.init = function() {
  observe();
}


/* OBSERVE Login State */

var observe = function() {
  var hasLoggedInBefore = false;
  
  Deps.autorun(function() {
    if (!Subscriptions.ready()) 
      return; // wait until subscriptions are ready
    
    if (Meteor.userId()) { // user logged in
      hasLoggedInBefore = true;
      Deps.nonreactive(loggedIn);
    }
    
    if (!Meteor.userId() && hasLoggedInBefore) {  // user logged out
      hasLoggedInBefore = false;
      Deps.nonreactive(loggedOut);
    }
  });
}


/* LOGIN EVENT handlers */

// when user is logged in by filling in its credentials
var manuallyLoggedIn = function() {
  /* do nothing */
}

// when user becomes logged in
var loggedIn = function() {

  // log
  GAnalytics.event("LoginService", "login", "automatically");

  // set currentCity (which user is visiting) based on city in the url
  if (Meteor.user().isAdmin)
    Users.update(Meteor.userId(), {$set: {currentCity: Session.get('currentCity')}})


  // XXX maybe we can do this on the server side, because
  // meteor introduces a function called Accounts.validateLoginAttempt()
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

}

// when user becomes logged out
var loggedOut = function() {
  /* empty */
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



// check if there is an other existing user account
// that probably match the current user idenity
// we check that by using the browser persistent storage
checkDuplicateIdentity = function() {

  var currentService = amplify.store('currentLoginService');
  var previousSession = amplify.store('previousLoginSession');
  
  var isRecentlyCreated = new Date().getTime() - Meteor.user().createdAt.getTime() < 2*60*1000; //5min
  var isOtherService = previousSession && currentService && previousSession.service != currentService;
  var isOtherAccount = previousSession && previousSession.userId != Meteor.userId();
  var isAlreadyMerged = previousSession && (!Users.findOne(previousSession.userId) || Users.findOne(previousSession.userId).isDeleted);
  
  // when this is a new account (created in the last 2 minutes), then we check
  // if there are previously login session with an other account with different service
  // if so we notify the user that he has possible 2 account and we request to merge them
  var requestMerge = isRecentlyCreated && isOtherService && isOtherAccount && !isAlreadyMerged;

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
  var broadcastUser = Users.findOne({invitationPhrase: phrase});

  if (phrase) {
  
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

        goToEntryPage();
        
        // log to google analytics
        if (broadcastUser)
          GAnalytics.event('Invitations', 'invited by user', broadcastUser._id);
      }

      // clean
      Session.set('invitationPhrase', null);

    });

  } else {

    // clean
    Session.set('invitationPhrase', null);
  }
};

// user let us know that he has filled in his profile
// check on server if this is correct
checkCompletedProfile = function() { /* GLOBAL, called from hacker.js */
  if (Meteor.user().isIncompleteProfile) {
    exec(function() {
      Meteor.call('requestProfileCompleted', function(err) {
        if (err) {
          Session.set('isIncompleteProfileError', true);
          Router.reload();
          log(err);
        } else {
          Session.set('isIncompleteProfileError', false);
          goToEntryPage();
        }
      });
    });
  } else {
    checkAccess();
    Router.reload();
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
    var message = "<h3>Something went wrong...</h3>Please try again or <a href=\"&#109;&#097;&#105;&#108;&#116;&#111;:&#109;&#097;&#105;&#108;&#064;&#104;&#099;&#107;&#114;&#115;&#046;&#105;&#111;\">email</a> us.";
    
    // emailadres is in use by another user 
    if (err.reason === "duplicateEmail")
      message = "<h3>Oopsy!</h3>Please try one of the other services!";

    if (err.reason === "city unmatch") {
      var userCity = err.details;
      var cityUrl = Url.replaceCity(userCity);
      var cityDomain = Url.hostname(cityUrl);
      message = '<h3>oopsy!</h3><a href="'+cityUrl+'">'+cityDomain+'</a> looks more like your home ;)';
    }

    Session.set('serviceLoginError', message);
    Meteor.setTimeout(function() { Session.set('serviceLoginError', false); }, 12000);
    log(err);
  
  } else {

    // when the merged user account is located in an other city
    // we have to redirect the subdomain
    if (Meteor.user().city !== Session.get('currentCity') && !Meteor.user().isAdmin)
      Router.goToCity(Meteor.user().city);

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
    Meteor.logout(); 
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

        // when the merged user account is located in an other city
        // we have to redirect the subdomain
        if (Meteor.user().city !== Session.get('currentCity') && !Meteor.user().isAdmin)
          Router.goToCity(Meteor.user().city);
        
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




