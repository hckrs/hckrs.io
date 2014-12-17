
Invitations = new Meteor.Collection('invitations');

// Invitations is a collection that contains signup invitation codes
// new users must have such code in order to signup

Schemas.Invitation = new SimpleSchema([
  Schemas.default,
  {
    "broadcastUser": { // user that is permitted to distribute this code
      type: String
    },
    "receivingUser": { // new user that used this code to signup
      type: String
    }
  }
]);


Invitations.attachSchema(Schemas.Invitation);
