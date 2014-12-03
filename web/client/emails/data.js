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
  'personalWelcome10first',
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

// XXX currently hack in hacker data
// in future meteor releases we can make use of Blaze.toHTMLWithData
var hackerId = function () { return Session.get('hackerId'); }
var hackerProp = function(field) { return OtherUserProp(hackerId(), field); }

var data = {
  'name': function() {
    return hackerProp('profile.name').split(' ')[0];
  },
  'inviteSlots': function() {
    return hackerProp('invitations') || 0;
  },
  'inviteUrl': function() {
    return userInviteUrl(hackerId());
  },
  'city': function() {
    return CITYMAP[Session.get('currentCity')].name;
  },
  'citykey': function() { // lower case city name
    return Session.get('currentCity');
  },
  'staffName': function() {
    return property(Meteor.user(), 'profile.name').split(' ')[0];
  },
  'staffTitle': function() {
    return property(Meteor.user(), 'staff.title');
  },
  'staffEmail': function() {
    return property(Meteor.user(), 'staff.email');
  },
  'staffTwitter': function() {
    var twitter = CITYMAP[Session.get('currentCity')].twitter;
    return Safe.string(twitter ? '<a href="https://twitter.com/'+twitter+'">@'+twitter+'</a>' : ''); 
  },
  'staffPhone': function() {
    var phone = property(Meteor.user(), 'profile.phone');
    var available = property(Meteor.user(), 'profile.available');
    var visible = _.contains(available, 'call');
    return visible && phone ? phone : ''; 
  },
}


// automatic link data helpers to all templates
_.each(templates, function(tmpl) {
  Template['emailSubject_' + tmpl].helpers(data);
  Template['emailContent_' + tmpl].helpers(data);
})
