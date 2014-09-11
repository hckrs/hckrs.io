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
  The data helpers specified below are the general tags that can be used in
  email templates. Therefore use meteor's bracket notation, e.g. {{staff.email}}.
  
  You CANN'T use this tags to personalize the email to the recipient, but therefore 
  you can use MailChimp's Merge Tags. Merge tags look like *|NAME|*.
  They are specified in MailChimp > Lists > Settings > Merge Tags.
  Also there are more general Merge tags, described here: 
  http://kb.mailchimp.com/merge-tags/all-the-merge-tags-cheatsheet#Merge-tags-for-personalization 
*/
var data = {
  'city': function() {
    return CITYMAP[Session.get('currentCity')].name;
  },
  'name': function() {
    return property(Meteor.user(), 'profile.name');
  },
  'title': function() {
    return property(Meteor.user(), 'staff.title');
  },
  'email': function() {
    return property(Meteor.user(), 'staff.email');
  },
}


// automatic link data helpers to all templates
_.each(templates, function(tmpl) {
  Template['emailSubject_' + tmpl].helpers(data);
  Template['emailContent_' + tmpl].helpers(data);
})
