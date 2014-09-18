// Route Controller

LoginButtonsController = RouteController.extend({
  template: 'loginButtons',
  onRun: function() {
    Session.set('currentCity', this.params.city);
  },
  waitOn: function () {
    return [];
  }

});


/* Templates */

// bind the sign up buttons to the corresponding actions
Template.loginButtons.events({
  "click .signupService": Login.loginWithService
});

Template.loginButtons.rendered = function() {
  this.autorun(function() {
    if (Meteor.userId())
      sendLoginMsg();
  });
}



/* MESSAGE protocol */
// cross subdomain communication using a iframe and postMessage meachanism.
// iframe have root access while parent window only have city access.

// login withnin parent window
// by sending a cross domain message
// containing the localstorage token
var sendLoginMsg = function() {
  var city = Session.get('currentCity');
  var parentDomain = Url.replaceCity(city, Meteor.absoluteUrl());
  var token = localStorage.getItem('Meteor.loginToken');
  
  top.postMessage("token:" + token, parentDomain);
}

// receive a cross city message
var receiveLoginMsg = function(event) {
  var msg = event.originalEvent.data;
  var token = _.isString(msg) && /token:/.test(msg) && msg.replace('token:','');
  
  if (token)
    Meteor.loginWithToken(token);
}

// start listing for cross domain messages
$(window).on("message", receiveLoginMsg);
