/*
  DOCUMENTATION about how to use settings, is provided in /settings.js
*/



/* PRIVATE (server only) */

var settings = {
  
}




// 1. extend existing Settings object with the server specific settings 
// 2. extend settings object with environment specific public settings
// 3. extend settings object with environment specific private settings
Meteor.startup(function() {
  if (Settings && settings)
    _.extend(Settings, settings);
  if (Settings && Meteor.settings && Meteor.settings.public)
    _.extend(Settings, Meteor.settings.public);
  if (Settings && Meteor.settings)
    _.extend(Settings, _.omit(Meteor.settings, 'public'));
});