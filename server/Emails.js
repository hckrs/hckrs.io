

var siteName = Meteor.settings.public.siteName;
var siteEmail = Meteor.settings.public.siteEmail;
var siteUrl = Meteor.absoluteUrl(); 
var siteUrlShort = function() {
  return appHostname(); // defined in helpers.js
} 



/* E-mail general settings */

Accounts.emailTemplates.siteName = siteName+" <"+siteEmail+">";

Accounts.emailTemplates.from = siteName+" <"+siteEmail+">";



/* E-mail templates */

// verify your mail address

Accounts.emailTemplates.verifyEmail.subject = function (user) {
    return "Verify your e-mailaddress on " + siteUrlShort();
};
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
  // we change the default meteor verification url
  // because we use our own client-side router
  // that not depending on url hashes
  var url = url.replace('/#', ''); 

  return "Verify your new e-mailaddress by clicking the link below:\n\n" + url;
};



