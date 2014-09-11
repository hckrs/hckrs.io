
/* INVITATIONS */

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

Invitations = new Meteor.Collection('invitations', {
  schema: Schemas.Invitation
});


/* Permissions */

Invitations.deny(ALL);



/* Publish */

if (Meteor.isServer) {

  // Only publish invitation codes for the logged in user
  Meteor.publish("invitations", function (all) {
   
    if(!this.userId) 
      return [];

    // XXX in the future the admin page requires to fetch 
    // all invitations. Then do somehting with 'all'.
    
    return Invitations.find({$or: [ {broadcastUser: this.userId},
                                    {receivingUser: this.userId} ]});
  });
}


