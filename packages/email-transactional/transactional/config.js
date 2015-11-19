/* MAIL TEMPLATES */

Config = {
  siteName: undefined,
  siteEmail: undefined, 
  siteOwnerEmail: undefined, 
  siteUrl: undefined, 
  siteFrom: undefined, 
  siteUrlShort: undefined,
}

Meteor.startup(function() {
  Config.siteOwnerEmail = Settings.siteOwnerEmail;
  Config.siteUrl = Meteor.absoluteUrl();
  Config.siteFrom = Settings["siteName"] + " <" + Settings['siteEmail'] + ">";
  Config.siteUrlShort = function() { return Url.hostname(); } // defined in /lib/Url.js 

  Accounts.emailTemplates.siteName = Settings["siteName"];
  Accounts.emailTemplates.from = Config.siteFrom;
});
