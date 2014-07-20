// Route Controller

InvitationsController = DefaultController.extend({
  template: 'invitations',
  waitOn: function () {
    return [ 
      Meteor.subscribe('invitations') 
    ];
  }
});

Template.invitations_partial.helpers({
  'unusedTotal': function() { return Meteor.user().invitations; },
  'invitedTotal': function() { return Invitations.find({broadcastUser: Meteor.userId()}).count(); },
  'invitedUsers': function() { return _.invoke(Invitations.find({broadcastUser: Meteor.userId()}, {sort: {createdAt: 1}}).fetch(), 'receiver'); },
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