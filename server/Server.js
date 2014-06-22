

// server startup
Meteor.startup(function() {
  
  /* server startup */

  // add environment variables from settings file to current process environment
  if (Settings.env)
    _.extend(process.env, Settings.env);
  
  // print uptime to console
  uptimeLogging();

  // run every 6 hours
  Meteor.setInterval(runAfter6hours, 1000 * 60 * 60 * 6);
  
});


// run this function every 6 hours
var runAfter6hours = function() {

  // update user profile picture on startup
  ServicesConfiguration.updateProfilePictures();
}


// show server uptime in console
var uptimeLogging = function() {
  var startupDate = new Date();
  var logging = function() { 
    log("[Server Uptime]: " + moment(startupDate).fromNow(true)); 
  }
  Meteor.setInterval(logging, 15 * 60 * 1000);
}


