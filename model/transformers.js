


/* USERS */

if (Meteor.isClient) {
  
  Users._transform = function(user) {
    user.localRankHash = bitHash(user.localRank);
    user.globalRankHash = bitHash(user.globalRank);
    return user;
  }
}

if (Meteor.isServer) {

  // before update
  Users.before.update(function(userId, doc, fieldNames, modifier, options) {

    // make sure that urls start with http:// or https://
    if (modifier.$set && modifier.$set['profile.homepage'])
      modifier.$set['profile.homepage'] = externUrl(modifier.$set['profile.homepage']);
    if (modifier.$set && modifier.$set['profile.companyUrl'])
      modifier.$set['profile.companyUrl'] = externUrl(modifier.$set['profile.companyUrl']);

    return modifier;
  });


  // after updating
  Users.after.update(function(userId, doc, fieldNames, modifier, options) {

    /* 
      handle new e-mailaddress 
      insert into user's emails array 
      and send a verification e-mail
    */

    if (modifier.$set && modifier.$set['profile.email']) {
      var email = modifier.$set['profile.email'];
      var user = Users.findOne(userId);
      var emails = user.emails;
      var found = _.findWhere(emails, {address: email});

      // insert new e-mail
      if (!found)
        Users.update(userId, {$push: {'emails': {'address': email, verified: false}}});

      // verify e-mailaddres, by sending a verification e-mail
      // user will be temporary disallowed to enter the site
      if (!found || !found.verified) { 
        Accounts.sendVerificationEmail(userId, email);
        Users.update(userId, {$set: {'isAccessDenied': true}});
      }

      // remove previous mailaddress
      Meteor.setTimeout(_.partial(cleanEmailAddress, userId), 10000);
    }
  });

}




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





/* GOOD-STUFF */

if (Meteor.isServer) {

  // before update
  GoodStuffItems.before.insert(function(userId, doc) {
    doc.createdAt = newDate();
    doc.userId = userId;
    
    _.defaults(doc, {
      tags: {}
    });
    
    _.defaults(doc.tags, {
      hacking: [],
      types: [],
      keywords: []
    });
    
    return doc;
  });


  // after updating
  GoodStuffItems.after.insert(function (userId, doc) {
    if (doc.imageUrl) { // set overlay color
      var rgb = ProcesssImageResource(doc.imageUrl, AverageImageColor);  
      GoodStuffItems.update(doc._id, {$set: {'color': rgb}});
    }
  });

}
