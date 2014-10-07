
/* Emails Templates */


// collections

EmailTemplates = new Meteor.Collection('emailTemplates');


// schemas

Schemas.EmailTemplates = new SimpleSchema([
  Schemas.default,
  {
    "identifier": { type: String, optional: true }, /* short name to rember */
    "subject": { type: String, optional: true },
    "body": { type: String, optional: true },
    "usedIn": { type: [String], optional: true },
  }
]);



// add schema

EmailTemplates.attachSchema(Schemas.EmailTemplates);


/* Permissions */

EmailTemplates.allow(ADMIN);



/* Publish */

if (Meteor.isServer) {

  // publish GithubDump
  Meteor.publish("emailTemplates", function () {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return EmailTemplates.find();
  });


}







