
// ENVIRONMENT variables

// set e-mail server only at staging and production servers.
if (Meteor.settings.public.environment !== 'local')
  process.env["MAIL_URL"] = "smtp://machine@hckrs.io:IN2MR8K1RmnOxjGoSIIIQYMNHVSUIevNQqasdaW@mail.gandi.net:587";
