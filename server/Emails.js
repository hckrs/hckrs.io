
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

Mailing.fields = [
  'city',
  'globalId',
  'profile.email',
  'profile.name',
  'profile.picture',
  'profile.hacking',
  'profile.available',
  'invitations',
  'invitationPhrase',
  'isAmbassador',
  'isAdmin',
  'isIncompleteProfile',
  'isUninvited'
];

Mailing.subscribe = function(user, options, cb) {
  user = OtherUserProps(user, Mailing.fields);
  options = options || {};

  var params = {
    id: MailChimpOptions['listId'],
    update_existing: true,
    email: {email: options.previousEmail || user.profile.email},
    merge_vars: {
      "email": options.previousEmail ? user.profile.email : undefined,
      "NAME": user.profile.name || "",
      "CITY_ID": user.city,
      "CITY_NAME": CITYMAP[user.city].name,
      "PROFILE": userProfileUrl(user),
      "PICTURE": user.profile.picture,
      "INVITES": user.invitations,
      "INVITE_URL": userInviteUrl(user),
      "IS_AMBSSDR": user.isAmbassador ? "true" : "false",
      "IS_ADMIN": user.isAdmin ? "true" : "false",
      "IS_INCOMPL": user.isIncompleteProfile ? "true" : "false",
      "IS_UNINVIT": user.isUninvited ? "true" : "false",
      "groupings": [
        { name: 'hacking', groups: user.profile.hacking || [] },
        { name: 'available', groups: user.profile.available || [] }
      ]
    },
    replace_interests: true,
    double_optin: false,
    send_welcome: false,
  };

  console.log('subscribe', params)

  new MailChimp().call('lists', 'subscribe', params, cb || function(){});
}

Mailing.unsubscribe = function(emailToDelete, keepInList, cb) {
  
  var params = {
    id: MailChimpOptions['listId'],
    email: {email: emailToDelete},
    delete_member: !keepInList,
    send_goodbye: false,
    send_notify: !!keepInList,
  }

  console.log('unsubscribe', params)

  new MailChimp().call('lists', 'unsubscribe', params, cb || function(){});
}

// Observer user data changes and update mailing list
Meteor.startup(function() {
  var initialized = false;

  var selector = {
    "city": {$exists: true, $ne: ""}, 
    "profile.email": {$exists: true, $ne: ""}
  };

  Users.find(selector, {fields: fieldsArray(Mailing.fields)}).observe({
    added: function(user) {
      if (!initialized) return;
      Mailing.subscribe(user);
    },
    changed: function(newUser, oldUser) {
      var options = {};
      
      if (newUser.profile.email !== oldUser.profile.email) 
        options.previousEmail = oldUser.profile.email;

      Mailing.subscribe(newUser, options);
    }
  });

  initialized = true;  
});



