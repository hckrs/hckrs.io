/* server methods */
// these are methods that can be called from the client
// but executed on the server because of the use of private data


Meteor.methods({

  // search the user that is associated with the given e-mail verification token
  'getEmailVerificationTokenUser': function(token) {
    check(token, String);

    // user fields that can be send to the client
    var fields = {'_id': 1};
    
    // search user associated with this token
    var user = Meteor.users.findOne({'services.email.verificationTokens.token': token}, {fields: fields});

    if (!user)
      throw new Meteor.Error(500, "Unknow verification token");

    return user;    
  },

  // get the broadcast user associated with the given invitation phrase
  'getBroadcastUser': function(phrase) {
    check(phrase, Number);

    // fields of broadcast user to return
    var fields = {'_id': 1, 'profile.name': 1, 'profile.picture': 1};
  
    // search broadcast user
    var broadcastUser = Meteor.users.findOne({invitationPhrase: phrase}, {fields: fields});
    if (broadcastUser.mergedWith)
      broadcastUser = Meteor.users.findOne(broadcastUser.mergedWith, {fields: fields});

    if (!broadcastUser)
      throw new Meteor.Error(500, "Unknow broadcast user");

    return broadcastUser;
  },

  // fetching a webpage and return the content
  'request': function(url) {
    if (!Meteor.userId()) 
      throw new Meteor.Error(500, "Not authorized")
    return HTTP.get(url).content;
  }

});