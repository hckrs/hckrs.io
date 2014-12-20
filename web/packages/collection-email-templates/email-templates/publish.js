
// publish GithubDump
Meteor.publish("emailTemplates", function () {
  var user = Users.findOne(this.userId);

  if(!user || !Users.isAdmin(user))
    return [];  

  return EmailTemplates.find();
});