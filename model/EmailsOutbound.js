
/* Emails Outbound */


// collections

EmailsOutbound = new Meteor.Collection('emailsOutbound');


// schemas

Schemas.EmailsOutbound = new SimpleSchema([
  Schemas.default,
  {
    "kind"            : { type: String, optional: true, allowedValues: ['news', 'transactional', 'notification', 'growth'] },
    "type"            : { type: String, optional: true },
    "city"            : { type: String, optional: true, allowedValues: CITYKEYS },
    "from": { 
      type: new SimpleSchema({
        "email"       : { type: String },
        "name"        : { type: String, optional: true },
        "userId"      : { type: String, optional: true },
      }) 
    },
    "to": {
      type: [new SimpleSchema({
        "email"       : { type: String },
        "name"        : { type: String, optional: true },
        "type"        : { type: String, optional: true, allowedValues: ['to','cc','bcc'], defaultValue: 'to' },
        "userId"      : { type: String, optional: true },
        "messageId"   : { type: String, optional: true }, /* ref: Mandrill's message '_id' */
      })]
    },
    "subjectTemplate" : { type: String, optional: true }, /* ref: identifier */
    "bodyTemplate"    : { type: String, optional: true }, /* ref: identifier */
    "subject"         : { type: String, optional: true },
    "body"            : { type: String, optional: true },
    "tags"            : { type: [String], optional: true },
    "mergeVarsGlobal" : { type: [new SimpleSchema({"name": {type: String}, "content": {type: String}})], optional: true },
    "mergeVars": { 
      type: [new SimpleSchema({
        "rcpt"        : { type: String },
        "vars"        : { type: [new SimpleSchema({"name": {type: String}, "content": {type: String}})], optional: true },
      })]
    },
  }
]);



// add schema

EmailsOutbound.attachSchema(Schemas.EmailsOutbound);


/* Permissions */

EmailsOutbound.allow(ADMIN);



/* Publish */

if (Meteor.isServer) {

  // publish GithubDump
  Meteor.publish("emailsOutbound", function () {
    var user = Users.findOne(this.userId);

    if(!user || !isAdmin(user))
      return [];  

    return EmailsOutbound.find();
  });


}







