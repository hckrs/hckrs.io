

Meteor.startup(function() {
  
  /* server startup */

  // check if settingsfile is missing
  if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.environment)
    throw new Meteor.Error(500, "Settings file missing!");

  // add environment variables from settings file to current process environment
  if (Meteor.settings.env)
    _.extend(process.env, Meteor.settings.env);
  
  // print uptime to console
  uptimeLogging();
  
});



// show server uptime in console
var uptimeLogging = function() {
  var startupDate = new Date();
  var logging = function() { 
    log("[Server Uptime]: " + moment(startupDate).fromNow(true)); 
  }
  Meteor.setInterval(logging, 15 * 60 * 1000);
}


