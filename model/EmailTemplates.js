
/* Emails Templates */


// places where email templates can be used
EMAIL_TEMPLATE_USAGE_OPTIONS = [
  {
    value: "growthGithub", 
    label: "Growth Github", 
    vars: ['SIGNUP_URL','CITY_KEY','CITY_NAME','USERNAME','EMAIL','AVATAR_URL','FOLLOWERS','FOLLOWING','REPOS','GISTS','NAME','FIRSTNAME','WEBSITE','COMPANY','ADMIN_NAME','ADMIN_FIRSTNAME','ADMIN_EMAIL','ADMIN_TITLE','ADMIN_IMAGE_URL'],
    example: {
      'SIGNUP_URL': 'http://utrecht.hckrs.io/gh/FDMwdYYXxMY7dLcD4',
      'CITY_KEY': 'utrecht',
      'CITY_NAME': 'Utrecht',
      'USERNAME': 'Jarnoleconte',
      'EMAIL': 'jarno.leconte@me.com',
      'AVATAR_URL': 'https://avatars.githubusercontent.com/u/279767?v=2',
      'FOLLOWERS': 4,
      'FOLLOWING': 2,
      'REPOS': 3,
      'GISTS': 0,
      'NAME': 'Jarno Le Conté',
      'FIRSTNAME': 'Jarno',
      'WEBSITE': 'http://jarno.me',
      'COMPANY': 'Flyingweb',
      'ADMIN_NAME': 'Toon van Ramshorst',
      'ADMIN_FIRSTNAME': 'Toon',
      'ADMIN_EMAIL': 'toon@hckrs.io',
      'ADMIN_TITLE': 'co-founder hckrs.io',
      'ADMIN_IMAGE_URL': 'https://graph.facebook.com/toon.vanramshorst/picture?type=large',
    }
  },

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







