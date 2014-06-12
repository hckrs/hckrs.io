// Route Controller
// path: "/^\/\+\/(.*)/"

// set some session variables and then redirects to the frontpage
// the frontpage is now showing a picture of the user that has invited this visitor

InviteController = DefaultController.extend({
  template: 'frontpage',
  waitOn: function () {
    return [];
  },
  onBeforeAction: function() { 
    var phrase = Url.bitHashInv(this.params[0]);
        
    Session.set('invitationPhrase', phrase);

    // get associated broadcast user
    Meteor.call('getBroadcastUser', phrase, function(err, broadcastUser) {
      Session.set('invitationBroadcastUser', broadcastUser);
    });

    this.redirect('frontpage');
  }
});