

var ambassadorHelpers = {
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


Template.emailSubject_localMessage.helpers(ambassadorHelpers);
Template.emailMessage_localMessage.helpers(ambassadorHelpers);

Template.emailSubject_localMeetup.helpers(ambassadorHelpers);
Template.emailMessage_localMeetup.helpers(ambassadorHelpers);

Template.emailSubject_localMeetupReminder.helpers(ambassadorHelpers);
Template.emailMessage_localMeetupReminder.helpers(ambassadorHelpers);