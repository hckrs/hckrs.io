var self = this;

// Wrapper around meteor's Email.send funnction
// to specify additional options that allows us to force
// email sending, even when we are in development mode.
var _EmailSend = Email.send;
Email.send = function(options, forceSendingInDevelopMode) {
  if (!_.isBoolean(forceSendingInDevelopMode))
    forceSendingInDevelopMode = false; // prevent from programming errors

  // In development mode emails will be outputed to console
  // as long the user don't specify the flag forceSendingInDevelopMode
  if (Settings['environment'] === 'dev' || (Settings['environment'] !== 'production' && !forceSendingInDevelopMode))
    console.log("SEND EMAIL:\n", options); // output in console
  else
    _EmailSend(options); // sending email over smtp
}


Meteor.methods({
  'EmailSend': function(options, forceSendingInDevelopMode) {
    if (!self.Users) 
      throw new Meteor.Error(500, 'Users package not included.');
    else {
      Users.checkAmbassadorPermission();
      Email.send(options, forceSendingInDevelopMode);   
    }
  }
})