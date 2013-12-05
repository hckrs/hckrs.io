
if (Meteor.settings) {
  var keys = _.pick(Meteor.settings, 'NEW_RELIC_LICENSE_KEY', 'NEW_RELIC_APP_NAME');
  _.extend(process.env, keys);
}

if (!('NEW_RELIC_LICENSE_KEY' in process.env) || 
    !('NEW_RELIC_APP_NAME' in process.env)) {

  // no newrelic config vars setted
  // print warning to console
  console.log(
    "WARNING: Configuration for newrelic not found! Solve it by either " +
    "putting values for NEW_RELIC_LICENSE_KEY and NEW_RELIC_APP_NAME in " +
    "your meteor settings file or export them as environment variables."
  );

} else {

  // use newrelic
  process.env.NEW_RELIC_NO_CONFIG_FILE = true;
  console.log("Start newrelic from meteor package.")
  Npm.require('newrelic');
}