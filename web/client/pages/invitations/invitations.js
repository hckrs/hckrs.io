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
    return Users.myProp('invitations'); 
  },
  'invitedTotal': function() { 
    return Invitations.find({broadcastUser: Meteor.userId()}).count(); 
  },
  'invitedUserViews': function() { 
    var getUserView = function(u) { 
      return Users.userView(u.receivingUser); 
    };
    return Invitations.find({broadcastUser: Meteor.userId()}, {fields: {receivingUser: 1}, sort: {createdAt: 1}}).map(getUserView);
  },
  'availableSlots': function() { 
    return _.range(Users.myProp('invitations')); 
  },
  'link': function() { 
    var inviteUrl = Users.userInviteUrl(Users.myProps(['invitationPhrase']));
    return inviteUrl;
  },
  'linkUrl': function() { 
    var inviteUrl = Users.userInviteUrl(Users.myProps(['invitationPhrase']));
    return encodeURIComponent(inviteUrl); 
  }
});