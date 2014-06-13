// Route Controller

InvitationsController = DefaultController.extend({
  template: 'invitations',
  waitOn: function () {
    return [ 
      Meteor.subscribe('invitations') 
    ];
  },
  onBeforeAction: function() {
    if (!this.ready()) return;
    var invitedUserIds = _.pluck(Invitations.find().fetch(), 'receivingUser');
    this.subscribe('publicUserData', invitedUserIds).wait();
  }
});

Template.invitations_partial.helpers({
  'unusedTotal': function() { return Meteor.user().invitations; },
  'invitedTotal': function() { return Invitations.find({broadcastUser: Meteor.userId()}).count(); },
  'invitedUsers': function() { return _.invoke(Invitations.find({broadcastUser: Meteor.userId()}, {sort: {signedupAt: 1}}).fetch(), 'receiver'); },
  'availableSlots': function() { return _.range(Meteor.user().invitations); },
  'link': function() { 
    var phrase = Url.bitHash(Meteor.user().invitationPhrase);
    return Router.routes['invite'].url({phrase: phrase}); 
  },
  'linkUrl': function() { 
    var phrase = Url.bitHash(Meteor.user().invitationPhrase);
    return encodeURIComponent(Router.routes['invite'].url({phrase: phrase})); 
  }
});