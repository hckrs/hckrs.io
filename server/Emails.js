var MailChimpOptions = Settings['MailChimpOptions'];


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
  'mailings',
  'invitations',
  'invitationPhrase',
  'isAmbassador',
  'isAdmin',
  'isIncompleteProfile',
  'isUninvited'
];


// subscribe task
// which will update the user information within MailChimp
var _subscribe = function(options, cb) {
  user = OtherUserProps(options.user, Mailing.fields);

  var quotedItemString = function(array) {
    return _.map(array || [], function(item) { return "'"+item+"'"; }).join(',');
  }

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
      // 'AVAILABLE': quotedItemString(user.profile.available),
      // 'HACKING': quotedItemString(user.profile.hacking),
      "groupings": [
        { name: "available", groups: user.profile.available || [] },
        { name: "hacking", groups: user.profile.hacking || [] },
        { name: "mailings", groups: user.mailings || [] },
      ]
    },
    replace_interests: true,
    double_optin: false,
    send_welcome: false,
  };

  // console.log('subscribe', params)

  new MailChimp().call('lists', 'subscribe', params, cb);
}


// only send 5 subscribe tasks simultaneous to MailChimp. 
var _queue = async.queue(Meteor.bindEnvironment(_subscribe), 5);

Mailing.subscribe = function(user, options, cb) {
  options = options || {};
  options.user = user;

  // queue subscribe task
  _queue.push(options, cb || function(){});
}

Mailing.unsubscribe = function(emailToDelete, keepInList, cb) {
  
  var params = {
    id: MailChimpOptions['listId'],
    email: {email: emailToDelete},
    delete_member: !keepInList,
    send_goodbye: false,
    send_notify: !!keepInList,
  }

  // console.log('unsubscribe', params)

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



/* 
Options {
  from_name: String,
  from_email: String,
  to_name: String,
  subject: String,
  html: String,
  segments: {
    match: String(all|any),
    conditions: [
      { field: 'CITY_ID', op: 'eq', value: 'utrecht' }
    ]
  },
  test: String(EMAIL) // optional
} 
*/
Mailing.send = function(options) {

  var params = {
    type: "regular",
    options: {
      list_id: MailChimpOptions['listId'],
      subject: options.subject,
      from_email: options.from_email,
      from_name: options.from_name,
      to_name: options.to_name,
      inline_css: true,
      authenticate: false, // ??????
      analytics: {}, // ???
    },
    content: { html: options.html },
    segment_opts: options.segments
  }

  console.log('Send mailing:', params.options);
  console.log('To users:', options.segments);

  // on test environments, send always test e-mails. Never mail the users
  if (Settings['environment'] !== 'production') {
    console.log('Because you are on a development environment, this email will be only send to you. Users will not receive them.');
    if (!options.test) {
      console.log("No test e-mail account specified");
      throw new Meteor.Error(500, "No test e-mail account specified");
    }
  }

  var mailChimp = new MailChimp();
  mailChimp.call('campaigns', 'create', params, function(err, res) {
    if (err) throw new Meteor.Error(500, "Mail failed", err);

    if (options.test) {
      mailChimp.call('campaigns', 'send-test', {cid: res.id, test_emails: [options.test]}, function(err,res) {
        if (err) {
          console.log("Mailed failed", err);
          throw new Meteor.Error(500, "Mail failed", err);
        }
      });
    } else {
      mailChimp.call('campaigns', 'send', {cid: res.id}, function(err,res) {
        if (err) {
          console.log("Mailed failed", err);
          throw new Meteor.Error(500, "Mail failed", err);
        }
      });
    }
  }) 
}

Mailing.ambassadorSendTestNewsletter = function(subject, content, group) {
  return Mailing.ambassadorSendNewsletter(subject, content, group, true);
}

Mailing.ambassadorSendNewsletter = function(subject, content, group, isTest) {
  checkAmbassadorPermission();
    
  if (!_.contains(MAILING_VALUES, group)) 
    throw new Meteor.Error(500, "no valid group specified");

  // on test environments, send always test e-mails. Never mail the users
  if (Settings['environment'] !== 'production')
    isTest = true;

  var ambassador = Meteor.user();
  var city = ambassador.currentCity;
  var email = property(ambassador, 'ambassador.email');

  if (!email)
    throw new Meteor.Error(500, "no ambassador email specified");


  var html = Assets.getText('html-email.html')
  html = html.replace(/{{subject}}/g, subject);
  html = html.replace(/{{content}}/g, content);

  Mailing.send({
    from_name: ambassador.profile.name + " / hckrs.io",
    from_email: email,
    to_name: "Hackers " + CITYMAP[city].name,
    subject: subject,
    html: html,
    segments: {
      match: 'all',
      conditions: [
        { field: 'CITY_ID', op: 'eq', value: city },
        { field: 'interests-' + MailChimpOptions['group-mailings'], op: 'one', value: group },
        //{ field: 'interests-XXX', op: 'all', value: "apps,web" },
        //{ field: 'HACKING', op: 'like', value: "%'apps'%%'web'%" },
      ]
    },
    test: isTest ? email : undefined
  });
}




Meteor.methods({
  'ambassadorMailing': function(mail, isTest) {
    return Mailing.ambassadorSendNewsletter(mail.subject, mail.message, mail.group, isTest);
  },
  // 'ambassadorSendNewsletter': function(mail) {
  //   return Mailing.ambassadorSendNewsletter(mail.subject, mail.message, mail.group);
  // },
  // 'test-chimp': function() {
  //   var mailChimp = new MailChimp();
  //   mailChimp.call('lists', 'interest-groupings', {id: MailChimpOptions['listId']}, function(err, res) {
  //     console.log(err, res);
  //   });
  // }
});


