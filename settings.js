/* 
  Settings

  You can define settings in one of these files:
  1. /settings-local.json        (environment specific)
  2. /settings-staging.json      (environment specific)
  3. /settings-production.json   (environment specific)
  4. /server/settings.js         (server only)
  5. /settings.js                (client & server)
  

  All settings are available through the {Settings} object.

  When using same names in different files the value will be overriden.
  The 1st file overwrites the 2nd, 2nd overwrites 3th, etc...

  
  ENV SPECIFIC

  In the first 3 files you can specifiy environment specific settings.
  So it is possible to have different settings for production as for
  development. You can distinguish between private and public settings.
  > PUBLIC settings are provided both on client and server 
  > PRIVATE settings are only provided on the server.
  You have to define public settings within the {public} object, but these
  settings are still directly accessible through the Settings object without
  calling the property 'public'.

  
  ENV INDEPENDENT

  In the 4th file (/server/settings.js) you can define PRIVATE settings that 
  are only provided on the server and are indpendent of the environment. 

  In the 5th file (/settings.js) you can define PUBLIC settings that are 
  accessible on both client and server and are independent of
  the environment.

*/






/* PUBLIC (client & server) */

Settings = {
  "siteName": "hckrs.io",
  "siteEmail": "machine@hckrs.io",
  "siteOwnerEmail": "mail@hckrs.io",

  "mapboxDefault": "ramshorst.gd0ekbb3",
  "mapboxPlaces": "ramshorst.gcoejeom",

  "defaultNumberOfInvitesForNewUsers": 2,
  "maximumNumberOfUnusedInvitesPerUser": 6,

  /* Telescope settings */
  backgroundColor: 'blue',
  secondaryColor: 'red',
  buttonColor: 'yellow',
  headerColor: 'greeb',
}



// extend settings object with the environment specific settings.
Meteor.startup(function() {
  if (Meteor.settings && Meteor.settings.public)
    _.extend(Settings, Meteor.settings.public);

  if (Meteor.isClient) {
    // runs once after settings have loaded
    Session.set('settingsLoaded',true);
    analyticsInit();
  }
});


