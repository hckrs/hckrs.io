// Route Controller
// path: "/^\/\+\/(.*)/"

VerifyEmailController = DefaultController.extend({
  template: 'frontpage',
  onRun: function() {
    var token = this.params.token;
    
    // log to google analytics
    Meteor.call('getEmailVerificationTokenUser', token, function(err, user) {
      if (!err && user) 
        GAnalytics.event('EmailVerification', 'verified user', user._id);
      else GAnalytics.event('EmailVerification', 'invalid token', token);
    });
  },
  waitOn: function () {
    return [];
  },
  action: function() { 
    Accounts.verifyEmail(this.params.token, checkAccess);
    Router.go('hackers');
    this.stop();
  }
});