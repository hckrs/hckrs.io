
/* MAIL TEMPLATES */

var siteName, siteEmail, siteOwnerEmail, siteUrl, siteFrom, siteUrlShort;

Meteor.startup(function() {
  siteOwnerEmail = Settings.siteOwnerEmail;
  siteUrl = Meteor.absoluteUrl();
  siteFrom = Settings["siteName"] + " <" + Settings['siteEmail'] + ">";
  siteUrlShort = function() { return Url.hostname(); } // defined in /lib/Url.js 

  Accounts.emailTemplates.siteName = Settings["siteName"];
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

  // e-mail link must include the correct city
  if (user.city)
    url = Url.replaceCity(user.city, url);

  var text = "If you are a real person please place your input device pointer " + 
             "above the following anchor, followed by the onclick action:\n\n" + url;

  return text;
}



/* CUSTOM E-MAIL sending functions */

// this e-mail will be sent to the admins 
// when a new user joined the site
SendEmailsOnNewUser = function(userId) {

  var user = Users.findOne(userId);
  var city = user.city;
  var hash = Url.bitHash(user.globalId);
  var url = Meteor.absoluteUrl(hash);
  var cityUrl = Url.replaceCity(city, url);
  var cityHost = Url.hostname(cityUrl);  
  var toAmbassadors = _.compact(Users.find({city: city, "isAmbassador": true}).map(function(u) { return u.profile.email; }));
  var toAdmin = _.difference(_.compact(Users.find({"isAdmin": true}).map(function(u) { return u.profile.email; })), toAmbassadors);
  var userEmail = user.profile.email;

  var status = [];
  if (!userEmail)
    status.push("No e-mailaddress given (yet).")
  if (!user.profile.name)
    status.push("No name given (yet).")
  if (user.isUninvited)
    status.push("Not invited (yet).")

  var email = {};
  email.to = toAmbassadors;
  email.cc = toAdmin;
  email.from = siteFrom;
  email.replyTo = userEmail;
  email.subject = "New hacker on " + cityHost;
  email.text = "Hacker '" + user.profile.name + "' joined " + cityHost + ".\n\n" + cityUrl;
  if (status.length)
    email.text += "\n\nStatus:\n" + status.join("\n");  
  
  // send to admins and ambassadors of city
  Email.send(email);
  
}



/* Mail Chimp Interace */

Mailing = {};

Mailing.subscribe = function(user, cb) {
  user = OtherUserProps(user, ['city','profile.email','profile.name']);
  
  var city = user.city;
  var email = pathValue(user, 'profile.email');
  var splitName = (pathValue(user, 'profile.name') || "").split(' ');
  var firstName = _.first(splitName) || undefined;
  var lastName = _.rest(splitName).join(' ') || undefined;

  var params = {
    id: CITYMAP[city].mailChimpListId,
    double_optin: false,
    update_existing: true,
    replace_interests: false,
    email: {email: email},
    merge_vars: {
      "FNAME": firstName,
      "LNAME": lastName,
      groupings: []
    }
  };

  console.log('subscribe', params)

  new MailChimp().call('lists', 'subscribe', params, cb || function(){});
}

Mailing.unsubscribe = function(user, noDelete, cb) {
  user = OtherUserProps(user, ['city','profile.email']);

  var city = user.city;
  var email = pathValue(user, 'profile.email');

  var params = {
    id: CITYMAP[city].mailChimpListId,
    email: {email: email},
    delete_member: !noDelete,
    send_goodbye: false,
    send_notify: !!noDelete,
  }

  console.log('unsubscribe', params)

  new MailChimp().call('lists', 'unsubscribe', params, cb || function(){});
}

