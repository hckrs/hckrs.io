
/* Emails Templates */


// places where email templates can be used
EMAIL_TEMPLATE_USAGE_OPTIONS = [
  {value: "growthGithub", label: "Growth Github"},
  {value: "cityMailing", label: "City Mailing"},
  {value: "userMailing", label: "User Mailing"},
];
EMAIL_TEMPLATE_USAGE_VALUES = _.pluck(EMAIL_TEMPLATE_USAGE_OPTIONS, 'value');


// collections

EmailTemplates = new Meteor.Collection('emailTemplates');


// schemas

Schemas.EmailTemplates = new SimpleSchema([
  Schemas.default,
  {
    "identifier": { // short name for reference
      type: String, 
      label: 'Identifier (short readable name)',
      unique: true, 
      autoValue: function() { // value not allowed to update onces setted.
        if (this.isInsert) return this.value;
        if (this.isUpsert) return {$setOnInsert: this.value};
        this.unset(); 
      } 
    },
    "subject": { 
      type: String, 
      optional: true, 
      label: 'Subject (optional)' 
    },
    "body": { 
      type: String, 
      optional: true, 
      label: 'Body (optional)' 
    },
    "usedIn": { 
      type: [String], 
      optional: true, 
      allowedValues: EMAIL_TEMPLATE_USAGE_VALUES 
    },
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







