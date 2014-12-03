
/* GROWTH MAILING */

// Sending a github growth mail
// @param {String} city - city identifier
// @param {Array} userIds - document ID's from github users as stored in GrowthGithub collection
// @param {String} subjectIdentifier -  refer to some mail template by identifier
// @param {String} bodyIdentifier -  refer to some mail template by identifier
var githubGrowthMail = function(city, userIds, subjectIdentifier, bodyIdentifier) {
  checkAdminPermission();

  var subject = property(EmailTemplates.findOne({identifier: subjectIdentifier}), 'subject');
  var body = property(EmailTemplates.findOne({identifier: bodyIdentifier}), 'body');

  if (!subject || !body)
    throw new Meteor.Error(500, "incomplete message", "No subject or body provided.");

  var adminId = Meteor.userId();
  var admin = Meteor.user();
  var from_email = city + "@hckrs.io";

  var html = Assets.getText('html-email.html')
  html = html.replace(/{{subject}}/g, subject);
  html = html.replace(/{{content}}/g, body);
  html = html.replace(/{{unsubscribe}}/g, '');

  var users = GrowthGithub.find({_id: {$in: userIds}}).fetch();
  var allVars = _.findWhere(EMAIL_TEMPLATE_GROUPS_OPTIONS, {value: 'growthGithub'}).vars;
  var usedVars = _.filter(allVars, function(v){ return html.indexOf('*|'+v.toUpperCase()+'|*') > -1; });
 
  var to_list = _.map(users, function(user) {
    return { email: user.email, name: user.name || user.username, type: 'to', userId: user._id };
  });

  var globalVars = {
    "CITY_KEY": city,
    "CITY_NAME": CITYMAP[city].name,
    "ADMIN_NAME": property(admin, 'profile.name'),
    "ADMIN_FIRSTNAME": (property(admin, 'profile.name') || "").split(' ')[0],
    "ADMIN_EMAIL": property(admin, 'staff.email'),
    "ADMIN_TITLE": property(admin, 'staff.title'),
    "ADMIN_IMAGE_URL": property(admin, 'profile.picture'),
  }
 
  var merge_vars = _.map(users, function(user) {
   
    var vars = {
      'USERNAME': user.username,
      'EMAIL': user.email,
      'AVATAR_URL': user.avatarUrl,
      'FOLLOWERS': user.followers,
      'FOLLOWING': user.following,
      'REPOS': user.repos,
      'GISTS': user.gists,
      'WEBSITE': user.website,
      'COMPANY': user.company,
      'SIGNUP_URL': Url.replaceCity(city, Meteor.absoluteUrl('gh/'+user._id)),
      'NAME': user.name || user.username,
      'FIRSTNAME': (user.name || "").split(' ')[0] || user.username,
    };

    // include used vars in mandrill's format
    return { 
      rcpt: user.email, 
      vars: _.map(_.pick(vars, usedVars), function(val, key) { 
        return { name: key, content: val }; 
      }) 
    };
  });

  // include used vars in mandrill's format
  var global_merge_vars = _.map(_.pick(globalVars, usedVars), function(val, key) {
    return { name: key, content: val };
  });

  // on development/test environment, never send mail to the users
  var isTest;
  if (Settings['environment'] !== 'production') {
    isTest = true;
  }

  var mail = {
    "key": Settings['mandrill'] && Settings['mandrill'][isTest ? 'apiTestKey' : 'apiKey'],
    "message": {
      "html": html,
      "subject": subject,
      "from_email": from_email,
      // "from_name": "",
      "to": to_list,
      "important": false,
      "track_opens": true,
      "track_clicks": true,
      "inline_css": true,
      "preserve_recipients": false,
      "view_content_link": true,
      "merge": true,
      "global_merge_vars": global_merge_vars,
      "merge_vars": merge_vars,
      "tags": ['growth', 'github'],
    },
    "async": true,
  };

  var mail_internal = {
    kind: "growth",
    type: "growthGithub",
    city: city,
    from: {
      email: from_email, 
      userId: adminId
    },
    to: to_list,
    subjectTemplate: subjectIdentifier,
    bodyTemplate: bodyIdentifier,
    subject: subject,
    body: body,
    tags: ['growth', 'github'],
    mergeVars: merge_vars,
    mergeVarsGlobal: global_merge_vars,
  }

  // on development/test environment, send preview to staffmember only
  if (Settings['environment'] !== 'production') {
    console.log('TO', _.pluck(to_list, 'name'));
    console.log('EMAIL', mail);
    console.log('Because you are on a development environment, this email will be only send to you. Users will not receive them.');
  }

  // don't proceed on development machines
  if (Settings['environment'] === 'dev')
    return;

  // send email
  try {
    var url = 'https://mandrillapp.com/api/1.0/messages/send.json';
    var res = HTTP.post(url, {data: mail});
    
    if (res.statusCode !== 200)
      throw 'mailing failed with status code' + res.statusCode;

    // link mandrill's message IDs
    _.each(to_list, function(mail) {
      mail.messageId = property(_.findWhere(res.data, {email: mail.email}), '_id');
    });

    // save email
    EmailsOutbound.insert(mail_internal);

    // update Growth Users, saving messageId an Invitation Date
    _.each(to_list, function(mail) {
      GrowthGithub.update(mail.userId, {
        $set: { invitedAt: new Date(), messageId: mail.messageId }
      });
    });

    console.log('mailing succeed!')
  } catch(e) {
    console.log(e);
  }
}

Meteor.methods({
  'githubGrowthMail': githubGrowthMail,
});



/* SIGNUPS */


// observe new registered users
// if some new user signs up (or changes his email address)
// we will check this address is on the growth list
// if so, we attach the userId and mark as signed up.

var checkGrowthEmailAddress = function(userId, email) {

  // find related growth user
  var growthUser = GrowthGithub.findOne({ email: email, signupAt: {$exists: false} });

  // user not related to growth mailing
  if (!growthUser)
    return; 

  // mark growth user as signed up
  markGithubSignup(growthUser._id, userId);
}

var observeCallback = function(id, fields) {
  var addresses = _.pluck(fields.emails, 'address');
  _.each(addresses, _.partial(checkGrowthEmailAddress, id));
}

Users.find({}, {fields: {'emails': true}}).observeChanges({
  'added': observeCallback,
  'changed': observeCallback
});


// mark growth user as signed up
var markGithubSignup = function(docId, userId) {
  var modifier = {$set: { signupAt: new Date(), userId: userId }};
  GrowthGithub.update({_id: docId, userId: {$exists: false}}, modifier);
}


// when new user signed up with a growth phrase
// we will mark the growth entry
var verifyGrowthPhrase = function(type, phrase) {
  switch(type) {
    case 'github': markGithubSignup(phrase, Meteor.userId()); break;
  }
}

Meteor.methods({
  "verifyGrowthPhrase": verifyGrowthPhrase,
});