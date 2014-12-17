/* Mail Chimp Interace */

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
  user = Users.props(options.user, Mailing.fields);

  var quotedItemString = function(array) {
    return _.map(array || [], function(item) { return "'"+item+"'"; }).join(',');
  }

  var name = user.profile.name || "";

  var params = {
    id: MailChimpOptions['listId'],
    update_existing: true,
    email: {email: options.previousEmail || user.profile.email},
    merge_vars: {
      "email": options.previousEmail ? user.profile.email : undefined,
      "USER_ID": user._id,
      "FNAME": _.first(name.split(' ')),
      "LNAME": _.rest(name.split(' ')).join(' '),
      "NAME": name,
      "CITY_ID": user.city,
      "CITY_NAME": CITYMAP[user.city].name,
      "PROFILE": Users.userProfileUrl(user),
      "PICTURE": user.profile.picture,
      "INVITES": user.invitations,
      "INVITE_URL": Users.userInviteUrl(user),
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

  // don't proceed on development machines
  if (Settings['environment'] === 'dev')
    return;

  new MailChimp().call('lists', 'subscribe', params, cb);
}


// only send 5 subscribe tasks simultaneous to MailChimp. 
var _queue = async.queue(Meteor.bindEnvironment(_subscribe), 3);

Mailing.subscribe = function(user, options, cb) {
  options = options || {};
  options.user = user;

  // don't proceed on development machines
  if (Settings['environment'] === 'dev')
    return;

  // queue subscribe task
  _queue.push(options, cb || function(){});
}

Mailing.unsubscribe = function(emailToDelete, keepInList, cb) {

  // don't proceed on development machines
  if (Settings['environment'] === 'dev')
    return;
  
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

  Users.find(selector, {fields: Util.fieldsArray(Mailing.fields)}).observe({
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
