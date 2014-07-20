





/* INVITATIONS */

if (Meteor.isClient) {
  
  Invitations._transform = function(doc) {
    // add info of receiving user
    doc.receiver = function() {
      return Meteor.users.findOne(doc.receivingUser);
    } 
    return doc;  
  }
}





