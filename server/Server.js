
// XXX temporary HACK
// because meteor deal with keep-alive problems on large projects as this.
process.argv = _.without(process.argv, '--keepalive');
Meteor.startup(function () { console.log("LISTENING"); });


// server startup
Meteor.startup(function() {
  
  /* server startup */

  // add environment variables from settings file to current process environment
  if (Settings.env)
    _.extend(process.env, Settings.env);
  
  // print uptime to console
  uptimeLogging();

  // run after 15 minutes after startup
  // taken into account that the Heroku server
  // is restarted once every day
  Meteor.setTimeout(runAfterStartupDelayed, 1000 * 60 * 15);

  // startup repl when in development mode
  if (Settings['environment'] === 'local')
    Repl.start();
  
});


// run after 15 minutes after startup
// taken into account that the Heroku server
// is restarted once every day.
// And preventing development machines
// from running too often.
var runAfterStartupDelayed = function() {

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


