
// check if settingsfile is missing
if (!Meteor.settings || !Meteor.settings.public || !Meteor.settings.public.environment)
  throw new Meteor.Error(500, "Settings file missing!");


// SETTINGS (server only & secure)

Settings = {}



// METEOR SETTINGS (extended)
Settings = _.extend(Settings, _.omit(Meteor.settings, 'public'));


// ENVIRONMENT variables

// set e-mail server only at staging and production servers.
if (Meteor.settings.public.environment !== 'local')
  process.env["MAIL_URL"] = "smtp://machine@hckrs.io:IN2MR8K1RmnOxjGoSIIIQYMNHVSUIevNQqasdaW@mail.gandi.net:587";
