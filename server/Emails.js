

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
    return siteUrlShort() + "e-mail validation ";
};
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
  // we change the default meteor verification url
  // because we use our own client-side router
  // that not depending on url hashes
  var url = url.replace('/#', ''); 

  return "If you are a real person please place your input device pointer above the following anchor, followed by an single onclick action:\n\n" + url;
};



