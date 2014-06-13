

// server startup
Meteor.startup(function() {
  
  /* server startup */

  // add environment variables from settings file to current process environment
  if (Settings.env)
    _.extend(process.env, Settings.env);
  
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


