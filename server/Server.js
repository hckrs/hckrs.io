

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

  // info about local mode
  if (Settings['environment'] === 'local')
    console.info("Mailservers aren't configured in development mode. You can ignore the warnings.")
});


// run after 15 minutes after startup
// taken into account that the Heroku server
// is restarted once every day.
// And preventing development machines
// from running too often.
var runAfterStartupDelayed = function() {

  // update user profile picture on startup
  Account.userData.updateProfilePictures();
}


// show server uptime in console
var uptimeLogging = function() {
  var startupDate = new Date();
  var logging = function() {
    console.log("[Server Uptime]: " + moment(startupDate).fromNow(true));
  }
  Meteor.setInterval(logging, 15 * 60 * 1000);
}


