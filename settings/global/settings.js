
// check if settingsfile is missing
if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.environment)
  throw new Meteor.Error(500, "Settings file missing!");


// SETTINGS file for both CLIENT & SERVER
// along with this file their is /Server/Settings.js which only runs on server

Settings = {}
Settings = _.deepExtend(Settings, _.omit(Meteor.settings, 'public'))
Settings = _.deepExtend(Settings, Meteor.settings.public);



// SETTINGS

Settings["siteName"] = "hckrs.io";
Settings["siteEmail"] = "machine@hckrs.io";
Settings["siteOwnerEmail"] = "mail@hckrs.io";

Settings["mapboxDefault"] = "ramshorst.gd0ekbb3";

Settings['minimumUserCountToShow'] = 100;
Settings['firstNumberOfUsersAutoInvited'] = 10;
Settings['defaultNumberOfInvitesForNewUsers'] = 2;
Settings['defaultNumberOfInvitesForAutoInvitedUsers'] = 8;






// Third-party packages

SimpleSchema.debug = Settings['simpleSchemeDebug']

if (Meteor.isClient)
	AutoForm.setDefaultTemplate('plain');
