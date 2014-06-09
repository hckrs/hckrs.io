// this code loads first because of
// the alphabetic filename load order


Meteor.startup(function() {

  // language
  // XXX use English with Europe formatting
  // in the future we probably use navigator.language || navigator.userLanguage; 
  moment.lang('en-gb'); 

  // check for login
  observeLoginState();

});




