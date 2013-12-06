/* server methods */
// these are methods that can be called from the client
// but executed on the server because of the use of private data


Meteor.methods({
  "totalHackers": function() { 
    return Meteor.users.find({allowAccess: true, isDeleted: {$ne: true}}).count(); 
  }
});