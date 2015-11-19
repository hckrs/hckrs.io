
// publish GithubDump
  Meteor.publish("emailsOutbound", function () {
    var user = Users.findOne(this.userId);

    if(!user || !Users.isAdmin(user))
      return [];  

    return EmailsOutbound.find();
  });