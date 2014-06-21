


/* USERS */

if (Meteor.isClient) {

  var socialNameFromUrl = function(service, url) {
    return /[^./]*$/.exec(url)[0];
  }

  Users._transform = function(user) {
    user.localRankHash = Url.bitHash(user.localRank);
    user.globalRankHash = Url.bitHash(user.globalRank);

    // check if user is foreign
    // that mean he is registered in an other city
    // with respect to the curren city page
    user.isForeign = isForeign(user);
    
    // extract profile usernames from social urls
    if (user.profile && user.profile.social) {
      user.profile.socialName = {};
      _.each(user.profile.social, function(url, service) {
        user.profile.socialName[service] = socialNameFromUrl(service, url);
      });
    }
    
    return user;
  }
}

if (Meteor.isServer) {

  // before update
  Users.before.update(function(userId, doc, fieldNames, modifier, options) {

    // make sure that urls start with http:// or https://
    if (modifier.$set && modifier.$set['profile.homepage'])
      modifier.$set['profile.homepage'] = Url.externUrl(modifier.$set['profile.homepage']);
    if (modifier.$set && modifier.$set['profile.companyUrl'])
      modifier.$set['profile.companyUrl'] = Url.externUrl(modifier.$set['profile.companyUrl']);

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





