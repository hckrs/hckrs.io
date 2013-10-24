

/* LOGIN functionality */


// after the user has logged in, this function will be called
var loginCompleted = function (err) {
  if (err)
    console.log('Login ERROR', err.reason || 'Unknown error');
  else
    console.log("Logged in as user:", Meteor.userId());
}

// login using facebook
var loginWithFacebook = function() {
  var options = { requestPermissions: [ 'email', 'user_birthday' ] };
  Meteor.loginWithFacebook(options, loginCompleted);
}

// login using github
var loginWithGithub = function() {
  var options = { requestPermissions: [ 'user:email' /* XXX not working??? */ ] };
  Meteor.loginWithGithub(options, loginCompleted);
}

// login using twitter
var loginWithTwitter = function() {
  var options = { requestPermissions: [ /* no permission available */ ] };
  Meteor.loginWithTwitter(options, loginCompleted);
}

// sign out the current logged in user
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





