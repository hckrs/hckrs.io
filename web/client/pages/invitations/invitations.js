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
  'unusedTotal': function() { 
    return UserProp('invitations'); 
  },
  'invitedTotal': function() { 
    return Invitations.find({broadcastUser: Meteor.userId()}).count(); 
  },
  'invitedUserViews': function() { 
    var getUserView = function(u) { 
      return userView(u.receivingUser); 
    };
    return Invitations.find({broadcastUser: Meteor.userId()}, {fields: {receivingUser: 1}, sort: {createdAt: 1}}).map(getUserView);
  },
  'availableSlots': function() { 
    return _.range(UserProp('invitations')); 
  },
  'link': function() { 
    var bitHash = Url.bitHash(UserProp('invitationPhrase'));
    return Router.routes['invite'].url({inviteBitHash: bitHash}); 
  },
  'linkUrl': function() { 
    var bitHash = Url.bitHash(UserProp('invitationPhrase'));
    var inviteUrl = Router.routes['invite'].url({inviteBitHash: bitHash});
    return encodeURIComponent(inviteUrl); 
  }
});