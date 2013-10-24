




var login = function() {

  Meteor.loginWithFacebook({
    requestPermissions: []
  }, function (err) {
    if (err)
      Session.set('errorMessage', err.reason || 'Unknown error');
  });

}



Template.frontpage.events({
  "click #signup": login
});