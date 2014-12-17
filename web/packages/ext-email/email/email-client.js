
Email = {};

// allow Staff members to send emails from client-side
Email.send = function(options, forceSendingInDevelopMode, cb) {
  Meteor.call('EmailSend', options, forceSendingInDevelopMode, cb);
}
