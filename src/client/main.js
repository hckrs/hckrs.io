

var facebookOptions = { requestPermissions: [ 'email', 'user_birthday' /* XXX birthday not given by meteor? */ ] };
var githubOptions = { requestPermissions: [ 'user:email' /* XXX not working??? */ ] };
var twitterOptions = { requestPermissions: [ /* no permission available */ ] };



/* LOGIN functionality */

// after user tries to login, check if login succeed
var loginCompleted = function(err) {
  if (err) {
    // XXX TODO: handle the case when login fails
  }
}

// login by using a external service
var loginWithFacebook = function() { Meteor.loginWithFacebook(facebookOptions, loginCompleted); }
var loginWithGithub = function() { Meteor.loginWithGithub(githubOptions, loginCompleted); }
var loginWithTwitter = function() { Meteor.loginWithTwitter(twitterOptions, loginCompleted); }

// log out the current user
var logout = function() { Meteor.logout(); }


// bind the sign up buttons to the corresponding actions
Template.frontpage.events({
  "click #signupWithFacebook": loginWithFacebook,
  "click #signupWithGithub":   loginWithGithub,
  "click #signupWithTwitter":  loginWithTwitter
});

// bind the sign out button to the sign out action
Template.hackers.events({
  "click #signOutButton": logout
});




/* HACKERS list */

// get a list of all hackers
var getAllHackers = function() {
  return Meteor.users.find().fetch();
}

// bind data of the hackers list to the template
Template.hackers.helpers({
  "hackers": getAllHackers
});



/* MY PROFILE */

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

Template.profile.events({
  "click #addFacebookButton": addFacebook,
  "click #addGithubButton":   addGithub,
  "click #addTwitterButton":  addTwitter
});


