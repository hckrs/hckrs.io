

/* LOGIN functionality */


// after the user has logged in, this function will be called
var loginCompleted = function (err) {
  if (err)
    console.log('Login ERROR', err.reason || 'Unknown error');
  else
    console.log("Succesful logged in");
}

// login using facebook
var loginWithFacebook = function() {
  var options = { requestPermissions: [ /* no permission */ ] };
  Meteor.loginWithFacebook(options, loginCompleted);
}

// login using github
var loginWithGithub = function() {
  var options = { requestPermissions: [ /* no permission */ ] };
  Meteor.loginWithGithub(options, loginCompleted);
}

// login using twitter
var loginWithTwitter = function() {
  var options = { requestPermissions: [ /* no permission */ ] };
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


