

// PUBLISH

if (Meteor.isServer) {

  // publishing collections to the client
  

  /* INVITATIONS */

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