
if (Meteor.settings)
  _.extend(process.env, Meteor.settings.newrelic || {});

if (!('NEW_RELIC_LICENSE_KEY' in process.env) || 
    !('NEW_RELIC_APP_NAME' in process.env)) {

  // no newrelic config vars setted
  // print warning to console
  console.log(
    "WARNING: You must set the newrelic configuration by either putting the " +
    "config variables in a meteor settings file within the property 'newrelic' or " +
    "by exporting the individual config variables to your environment."
  );

  if (!Meteor.settings || !Meteor.settings.newrelic)
    console.log("WARNING: Maybe your settings file is missing?");

} else {

  // use newrelic
  process.env.NEW_RELIC_NO_CONFIG_FILE = true;
  Npm.require('newrelic');

}