

Meteor.startup(function() {
  
  /* server startup */
  
  _keepAlive(); // prevent Heroku app from going to sleeping mode
  
});



// prevent app from sleeping (in Heroku's dyno field)
// make sure there is activity every minute
var _keepAlive = function() {
  var startupDate = new Date();
  var signal = function() { return true; }; 
  var logging = function() { log("[Server Uptime]:" + moment(startupDate).fromNow(true)); }
  Meteor.setTimeout(logging, 1000);
  Meteor.setInterval(signal, 5000);
  Meteor.setInterval(logging, 55000);
}



// GLOBAL server functions
// these functions can be called from everywhere on the server

// ...
