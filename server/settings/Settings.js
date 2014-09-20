
// check if settingsfile is missing
if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.environment)
  throw new Meteor.Error(500, "Settings file missing!");


// SETTINGS (server only & secure)

Settings = {}



// METEOR SETTINGS (extended)
Settings = _.extend(Settings, _.omit(Meteor.settings, 'public'));


// ENVIRONMENT variables

// set default smtp server for emails sent using meteor's SMTP methods
// on local development machines the messages will be outputed to the console

var smtp = Settings['smtp'];
var smtp_url = "smtp://"+smtp.username+":"+smtp.password+"@"+smtp.server+":"+smtp.port;

if (Settings['environment'] !== 'local')
  process.env["MAIL_URL"] = smtp_url;