
// check if settingsfile is missing
if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.environment)
  throw new Meteor.Error(500, "Settings file missing!");


// SETTINGS (server only & secure)

Settings = {}




// ENVIRONMENT variables
process.env["MAIL_URL"] = "smtp://machine@hckrs.io:IN2MR8K1RmnOxjGoSIIIQYMNHVSUIevNQqasdaW@mail.gandi.net:587";
