/* Server-Side Hooks */

// after updating
Users.after.update(function(userId, doc, fieldNames, modifier, options) {
  var prevUser = this.previous;
  var user = doc;

  var prevEmail = Util.property(prevUser, 'profile.email');
  var email = Util.property(user, 'profile.email');
  
  /* 
    handle new e-mailaddress 
    insert into user's emails array 
    and send a verification e-mail
  */
  if (modifier.$set && modifier.$set['profile.email'] && email !== prevEmail) {

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

    // e-mail already verified, give access to site
    if (found && found.verified)
      Account.requestAccessOfUser(userId)  

    // remove previous mailaddress
    Meteor.setTimeout(_.partial(Account.cleanEmailAddress, userId), 10000);
  }
});