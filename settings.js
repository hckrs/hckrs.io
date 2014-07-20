

// SETTINGS file for both CLIENT & SERVER
// along with this file their is /Server/Settings.js which only runs on server

Settings = _.extend(this.Settings || {}, Meteor.settings.public);




// SETTINGS

Settings["siteName"] = "hckrs.io";
Settings["siteEmail"] = "machine@hckrs.io";
Settings["siteOwnerEmail"] = "mail@hckrs.io";

Settings["mapboxDefault"] = "ramshorst.gd0ekbb3";

Settings['defaultNumberOfInvitesForNewUsers'] = 2;
Settings['maximumNumberOfUnusedInvitesPerUser'] = 6;
Settings['minimumUserCountToShow'] = 100;
Settings['firstNumberOfUsersAutoInvited'] = 10;



