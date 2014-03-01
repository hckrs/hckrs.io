



Meteor.startup(function() {

  var siteName = Settings['siteName'];
  var siteEmail = Settings['siteEmail'];
  var siteOwnerEmail = Settings['siteOwnerEmail'];
  var siteUrl = Meteor.absoluteUrl();
  var siteFrom = siteName + " <" + siteEmail + ">";
  var siteUrlShort = function() { return appHostname(); } // defined in helpers.js 



  /* CUSTOM E-MAIL sending functions */

  // this e-mail will be sent to the admins 
  // when a new user joined the site
  SendEmailOnNewUser = function(user) {
    if (!Settings['sendEmailOnNewUser']) return;

    var userUrl = Meteor.absoluteUrl(bitHash(user.localRank));

    var subject = "New hacker on " + siteUrlShort();
    var text = "Hacker '" + user.profile.name + "' joined " + siteUrlShort() + ".\n\n" + userUrl;

    Email.send({from: siteFrom, to: siteOwnerEmail, subject: subject, text: text});
  }



  /* METEOR E-MAIL TEMPLATES */

  Accounts.emailTemplates.siteName = siteName;
  Accounts.emailTemplates.from = siteFrom;  

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

});











