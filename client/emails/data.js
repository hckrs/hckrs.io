/* 
  Along with this file there is a file  /model/data/Constants.js
  where we can specify the different email groups. The e-mail groups
  corresponds with some addresses lists on MailChimp.
  Some of the templates defined below are associated with such group.
  This association is made in the HTML form when composing email.
*/

/* List here all e-mail templates */
var templates = [
  'localMeetup',
  'localMeetupReminder',
  'localMessage',
  'personalInviteSlots',
  'personalMessage',
  'personalMissingInfo',
  'personalWelcome',
]

/* 
  The data helpers specified below are available within email templates.
  Use the meteor bracket notation for this, e.g. {{city}}.
  Additional there are the MailChimp Merge Tags that can be 
  used to personalize recipient's email.
  Merge tags look like *|NAME|*
  They are specified in MailChimp > Lists > Settings > Merge Tags.
  Also there are general Merge tags, described here: 
  http://kb.mailchimp.com/merge-tags/all-the-merge-tags-cheatsheet#Merge-tags-for-personalization 
*/
var data = {
  'city': function() {
    return CITYMAP[Session.get('currentCity')].name;
  },
  'ambassadorName': function() {
    return Meteor.user().profile.name;
  },
  'ambassadorTitle': function() {
    return Meteor.user().ambassador.title || "admin";
  },
  'ambassadorEmail': function() {
    return Meteor.user().ambassador.email;
  }
}


// automatic link data helpers to all templates
_.each(templates, function(tmpl) {
  Template['emailSubject_' + tmpl].helpers(data);
  Template['emailMessage_' + tmpl].helpers(data);
})
