
/* MAIL TEMPLATES */

var siteName, siteEmail, siteOwnerEmail, siteUrl, siteFrom, siteUrlShort;

Meteor.startup(function() {
  siteName = Settings.siteName;
  siteEmail = Settings.siteEmail;
  siteOwnerEmail = Settings.siteOwnerEmail;
  siteUrl = Meteor.absoluteUrl();
  siteFrom = siteName + " <" + siteEmail + ">";
  siteUrlShort = function() { return Url.hostname(); } // defined in /lib/Url.js 

  Accounts.emailTemplates.siteName = siteName;
  Accounts.emailTemplates.from = siteFrom;
});




/* METEOR E-MAIL TEMPLATES */

// verify your mail address
Accounts.emailTemplates.verifyEmail.subject = function (user) {
  return "email validation";
}
Accounts.emailTemplates.verifyEmail.text = function (user, url) {
  
  // we change the default meteor verification url
  // because we use our own client-side router
  // that not depending on url hashes
  var url = url.replace('/#', ''); 

  var text = "If you are a real person please place your input device pointer " + 
             "above the following anchor, followed by the onclick action:\n\n" + url;

  return text;
}



/* CUSTOM E-MAIL sending functions */

// this e-mail will be sent to the admins 
// when a new user joined the site
SendEmailOnNewUser = function(user) {
  
  if (Settings['environment'] === 'production') { // only in production
    
    var userUrl = Meteor.absoluteUrl(Url.bitHash(user.localRank));
    var subject = "New hacker on " + siteUrlShort();
    var text = "Hacker '" + user.profile.name + "' joined " + siteUrlShort() + ".\n\n" + userUrl;
    
    Email.send({from: siteFrom, to: siteOwnerEmail, subject: subject, text: text});
  }
}


