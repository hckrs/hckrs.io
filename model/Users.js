
// Meteor.users is a collection that is already defined by meteor.
// But we attach a schema to validate content.

// ATTENTION: when changing the model, make sure you also change
// the publish, permissions and merging rules in  
// Publish.js, Permissions.js and ServicesConfiguration.js respectively.

var schema = {
 
  "profile": {          // user's public profile (visible for other users)
    type: Object
  },

  "profile.name": {  // full name of the user    
    type: String,
    min: 1,
    max: 30
  },         
  "profile.email": {  // e-mailadress (can be hidden if user want it)
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },    
  "profile.skype": { // skype address
    type: String,
    optional: true,
  },
  "profile.phone": { // phone number
    type: String,
    optional: true,
  },
  "profile.picture": {  // url of an avatar for this user
    type: String
  },    
  
  "profile.location": {  // workplace (school / company)
    type: new SimpleSchema({
      lat: {type: Number, decimal: true},
      lng: {type: Number, decimal: true},
    }),
    optional: true
  },
  "profile.homepage": { // external website of user
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    autoValue: AutoValue.prefixUrlWithHTTP
  },     
  "profile.company": { // name of company
    type: String,
    optional: true
  },
  "profile.companyUrl": {  // the website of the company 
    type: String,
    regEx: SimpleSchema.RegEx.Url,
    optional: true,
    autoValue: AutoValue.prefixUrlWithHTTP
  },
  
  "profile.hacking": {    // array of types (web|apps|software|game|design|life|hardware|opensource|growth)*
    type: [ String ],
    allowedValues: HACKING,
    optional: true
  },
  "profile.available": {  // array with items where user is available for (drink|lunch|email)*
    type: [ String ],
    allowedValues: _.pluck(AVAILABLE_OPTIONS, 'value'),
    optional: true
  },
  "profile.skills": { // array of skill name
    type: [ String ],
    optional: true,
    allowedValues: SKILL_NAMES
  },           
  "profile.favoriteSkills": { // skills that are also marked as favorite
    type: [ String ],
    optional: true,
    allowedValues: SKILL_NAMES
  },    
  
  "profile.social": { // urls to user's social service profiles
    type: Object
  },
  "profile.social.facebook": {
    type: String,
    optional: true
  },
  "profile.social.github": {
    type: String,
    optional: true
  },
  "profile.social.twitter": {
    type: String,
    optional: true
  },
  
  "profile.socialPicture": { // urls to user's social pictures
    type: Object
  },
  "profile.socialPicture.facebook": {
    type: String,
    optional: true
  },
  "profile.socialPicture.github": {
    type: String,
    optional: true
  },
  "profile.socialPicture.twitter": {
    type: String,
    optional: true
  },


  /* user properties */

  "city": {             // the city where this hacker is registered to (lowercase)
    type: String,
    allowedValues: CITYKEYS
  },        
  "currentCity": {      // the city this (admin) user is visiting
    type: String,
    allowedValues: CITYKEYS
  },   
  "globalId": {       // assigned hacker number based on create-account-order of all world hackers
    type: Number
  },
  "invitationPhrase": { // uniq number that used in the invite url that this user can share with others
    type: Number
  },   
  "invitations": {      // number of unused invites that this user can use to invite people
    type: Number,
    min: 0
  },    
  
  "emails": {           // user can have multiple e-mailaddressen (internal use only)
    type: [Object]
  },
  "emails.$.address": {
    type: String,
    regEx: SimpleSchema.RegEx.Email
  },
  "emails.$.verified": {  // e-mailadress is verified by clicking the link in enrollment mail
    type: Boolean
  },

  /* mailing options */

  "mailings": {
    type: [ String ],
    allowedValues: _.pluck(MAILING_OPTIONS, 'value'),
    optional: true
  },


  /* administration details */

  "staff": {         // additional ambassador info
    type: Object,
    optional: true
  },
  "staff.email": { // ambassador email address @hckrs.io
    type: SimpleSchema.RegEx.Email,
    optional: true         
  },
  "staff.title": { // custom title of this ambassador     
    type: String,
    optional: true         
  },

  "isAmbassador": {       // only when user is ambassador    
    type: Boolean,
    optional: true,
  },
  "isAccessDenied": {      // user isn't allowed to enter the site unless he is invited and profile complete and email verified 
    type: Boolean,
    optional: true
  }, 
  "isUninvited": {         // flag wheter this user is not invited
    type: Boolean,
    optional: true
  }, 
  "isIncompleteProfile": {     // new users starts with an incomplete profile until user pressed the 'ready' button
    type: Boolean,
    optional: true
  }, 
  "isHidden": {            // this user isn't visible to others (denied users & admins)
    type: Boolean,
    optional: true
  }, 
  "isAdmin": {             // true if this user has admin privilege
    type: Boolean,
    optional: true
  }, 
  "accessAt": {         // moment that user get full access to some city (complete profile & invited)
    type: Date,
    optional: true,
  },
  "isDeleted": {           // mark this account as deleted (probably merged with other account)
    type: Boolean,
    optional: true
  }, 
  "deletedAt": {              // date of deletion
    type: Date,
    optional: true
  }, 
  "mergedWith": {           // userId of the user where this accounts is merged with
    type: String,
    optional: true
  }, 

  /* fields assigned by meteor */

  "services": {           // meteor stores login information here...
    type: Object,
    optional: true,
    blackbox: true
  }

}

// We create a weak schema which we attach to the user collection
// because new registered users don't have all the required properties filled in.
// Therefore User collection will be weakly verified and must be manually strongly verified
// at update actions from untrusted code
var weakSchema = {};
weakSchema['city'] = {optional: true};
weakSchema['currentCity'] = {optional: true};
weakSchema['globalId'] = {optional: true};
weakSchema['invitationPhrase'] = {optional: true};
weakSchema['invitations'] = {optional: true};
weakSchema['profile.name'] = {optional: true};
weakSchema['profile.email'] = {optional: true};


// create SimpleSchema
Schemas.User = new SimpleSchema([
  Schemas.default,
  schema
]);

// create weak SimpleSchema
Schemas.WeakUser = new SimpleSchema([
  Schemas.User,
  weakSchema
]);


// NOTE: services schema (blackbox)
var servicesSchema = {
  resume: {  
    loginTokens: [ { token: String, when: Date } ]
  },
  email: {
    verificationTokens: [ { token: String, address: String, when: Date } ]
  },
  facebook: { /* ... */ },
  github: { /* ... */ },
  twitter: { /* ... */ },
}



/* Setup */

// Users collection already created by meteor, make an alias
Users = Meteor.users;


// attach the weak schema to the user collection
// later we have to verify the untrusted update actions
// against the strong schema
Users.attachSchema(Schemas.WeakUser)





/* Permissions */

// meteor allow users to update their public profiles therefore we need to
// specify DENY rules for the user collection to overwrite meteor rules.

Users.allow(ALL);
Users.deny({
  fetch: ['profile.socialPicture', 'city'],
  insert: TRUE, /* deny */
  remove: TRUE, /* deny */
  update: function(userId, doc, fields, modifier) {

    var userPermission = [
      'updatedAt',
      'profile.email',
      'profile.skype',
      'profile.phone',
      'profile.picture',
      'profile.name',
      "profile.location",
      "profile.homepage",
      "profile.company",
      "profile.companyUrl",
      "profile.hacking",
      "profile.available",
      "profile.skills",
      "profile.favoriteSkills",
      "mailings",
    ];

    var ambassadorPermission = [
      'invitations',
    ];

    var adminPermission = [
      'currentCity',

      /* also alow, only for easy updates */
      'isAmbassador',
      'staff',
      'profile',
    ];

    // determine the permissions of user who edit this doc
    var fields = [];
    if (hasAdminPermission())  // admin
      fields = _.union(userPermission, ambassadorPermission, adminPermission);
    else if (hasAmbassadorPermission(userId, doc.city)) // ambassador
      fields = _.union(userPermission, ambassadorPermission);
    else if (_.isEqual(userId, doc._id)) // user owned this doc
      fields = _.union(userPermission);

    // create match pattern
    var pattern = _.object(fields, _.map(fields, function(_) { return Match.Optional(Match.Any); }))

    // modify pattern for some special fields
    if (pattern["profile.picture"])
      pattern["profile.picture"] = Match.Optional(Match.In(_.values(doc.profile.socialPicture || {})));

    // duplicate pattern for all types of modifiers
    var types = ['$set','$unset','$push','$pull','$addToSet'];
    var modifierPattern = _.object(types, _.map(types, function(_) { return Match.Optional(pattern); }))

    // test pattern for permissions
    if (!Match.test(modifier, modifierPattern))
      return true; /* DENY */

    // test against strong user schema
    if (!Schemas.User.newContext().validate(modifier, {modifier: true}))
      return true; /* DENY */
  
  }
});


    


/* Publish */

// Publish the users to the client. A detailed specification of 
// which fields will be published is given here

if (Meteor.isServer) {


  // all users will be published, but which fields are includes can vary along users.
  // which fields to include is difficult logic because of conditions/dependencies,
  // it depends on the access level of the logged in user
  // and the privacy settings of the published user docs.
  // this will be handled by the filterUserFields function

  var userFieldsGlobal = [
    "city",
    "currentCity",
    "globalId",
    "invitationPhrase",
    "profile.name",
    "profile.picture",
    "isHidden",
    "isAccessDenied",
    "isDeleted",
    "mergedWith",
  ];
  var userFieldsData = [
    "accessAt",
    "profile.location",
    "profile.homepage",
    "profile.company",
    "profile.companyUrl",
    "profile.hacking",
    "profile.available",
    "profile.social",
    "profile.skills",
    "profile.favoriteSkills",
    // DON'T INCLUDE: "profile.socialPicture",
  ];
  var userFieldsEmail = [ // visible when user 'available for email' is checked
    "profile.email",
  ];
  var userFieldsCall = [ // visible when 'available for call' is checked
    "profile.skype",
    "profile.phone",
  ];
  var userFieldsAmbassador = [  // all users can see always this addtional fields from ambassadors
    "isAmbassador",
    "staff",
    "profile.email",
    "profile.social",
  ];
  var userFieldsCurrentUser = [
    "createdAt",
    "isAdmin",
    "isAccessDenied",
    "isUninvited",
    "isIncompleteProfile",
    "invitations",
    "profile.socialPicture",
    "emails",
    "mailings",
  ];

  var allUserFields = _.union(
    userFieldsGlobal, 
    userFieldsData, 
    userFieldsEmail, 
    userFieldsCall, 
    userFieldsAmbassador, 
    userFieldsCurrentUser
  );  

  // properties of the current logged in user that determine the user's permissions (in filterUserFields()).
  // When one of these properties changes it affects the visible fields of other users.
  // So when an dependency changes, we have to republish the whole collection to test
  // each user doc against the new permission rights.
  // Only first-level properties are allowed, such as 'profile', but NOT 'profile.name'
  var permissionDeps = [
    '_id',
    'isAccessDenied',
    'isAdmin',
    'city',
    'currentCity',
    'isAmbassador'
  ];


  Meteor.publish('userData', function() {
    var self = this;
    var queryOptions = {fields: fieldsArray(allUserFields)};
    
    // initial permissions (can be changed below)
    var permissions = Users.findOne(this.userId, {fields: fieldsArray(permissionDeps)}) || {};
    
    // observe docs changes and push the changes to the client
    // only include fields that are allowed to publish, this can vary between users
    // and will be handled by the filterUserFields() function.
    var observer = Users.find({}, queryOptions).observe({
      added: function(doc) {
        self.added('users', doc._id, excludeUserFields(permissions, doc, false));
      },
      changed: function(doc) {
        self.changed('users', doc._id, excludeUserFields(permissions, doc, true));
      },
      removed: function(doc) {
        self.removed('users', doc._id);
      }
    });

    // republish user collection
    // because permission of current user have changed
    var republish = function(newPermissions) {
      permissions = newPermissions; // ! set new permissions
      Users.find({}, queryOptions).forEach(function(doc) {
        self.changed('users', doc._id, excludeUserFields(permissions, doc, false));
      });
    }

    // Check if depended permissions fields from current user changes
    // if so, we have to republish the whole user collection
    if (self.userId)
      var myObserver = Users.find({_id: self.userId}, {fields: fieldsArray(permissionDeps)}).observe({'changed': republish});


    // handlers
    self.onStop(function () {
      if (observer) observer.stop();
      if (myObserver) myObserver.stop();
    });
    self.ready();
  });


  // determine which user fields to publish.
  // it depends on the permissions of the logged in user
  // and the privacy settings of the published user docs.
  var excludeUserFields = function(permissions, doc, isUpdate) {
    
    // first determine current user's permission before continue.
    var hasAccess = permissions.isAccessDenied != true;
    var isSameCity = cityMatch(permissions.city, doc.city);
    var isAdmin = permissions.isAdmin;
    var isAmbassador = permissions.isAmbassador;


    // holds which fields to publish        
    var useFields = [];

    
    // publish this data of all users anyway
    useFields.push(userFieldsGlobal);
    
    if (doc.isAmbassador)
      useFields.push(userFieldsAmbassador);

    
    // publish this data only if
    // current user has access to the site
    // and the published user is in the same city
    if (hasAccess && isSameCity) {
      useFields.push(userFieldsData);

      var available = property(doc, 'profile.available') || [];
      
      // only publish e-mailadresses of user who accepted that
      if (someIn(['drink','lunch','email','cowork','couchsurf'], available))
        useFields.push(userFieldsEmail);
    
      // only publish phone/skype information of user who accepted that
      if (someIn(['call', 'couchsurf'], available))
        useFields.push(userFieldsCall);
    }

    // include all user data when logged in as admin or ambassador
    // and also for the logged in user itself.
    if (isAdmin || 
        (isAmbassador && isSameCity) || 
        (permissions && permissions._id === doc._id)) {
      useFields.push(userFieldsData); // include user data
      useFields.push(userFieldsEmail); // include e-mail
      useFields.push(userFieldsCall); // include e-mail
      useFields.push(userFieldsCurrentUser); // include private info
    }


    
    // returning the user doc with only visible fields included
    // this doc is send to the client and only may contain the data
    // that the logged in user is allowed to see from this user doc.
    // mark all other fields as undefined, to make sure they will me removed from client db

    var undefinedUser = {};
    _.each(allUserFields, function(field) { 
      _.deep(undefinedUser, field, undefined); 
    });
    
    var publishUser = _.deepPick(doc, _.union.apply(this, useFields));
    
    return isUpdate ? _.extend(undefinedUser, publishUser) : publishUser;
  }

  // helper
  var cityMatch = function(city1, city2) {
    return city1 && city2 && city1 === city2;
  }






  /* Server-Side Hooks */


  // after updating
  Users.after.update(function(userId, doc, fieldNames, modifier, options) {
    var prevUser = this.previous;
    var user = doc;

    var prevEmail = pathValue(prevUser, 'profile.email');
    var email = pathValue(user, 'profile.email');
    
    /* 
      handle new e-mailaddress 
      insert into user's emails array 
      and send a verification e-mail
    */
    if (modifier.$set && modifier.$set['profile.email'] && email !== prevEmail) {

      var emails = user.emails;
      var found = _.findWhere(emails, {address: email});      

      // insert new e-mail
      if (!found)
        Users.update(userId, {$push: {'emails': {'address': email, verified: false}}});

      // verify e-mailaddres, by sending a verification e-mail
      // user will be temporary disallowed to enter the site
      if (!found || !found.verified) { 
        Accounts.sendVerificationEmail(userId, email);
        Users.update(userId, {$set: {'isAccessDenied': true}});
      }

      // e-mail already verified, give access to site
      if (found && found.verified)
        requestAccessOfUser(userId)  

      // remove previous mailaddress
      Meteor.setTimeout(_.partial(cleanEmailAddress, userId), 10000);
    }
  });
}




/* QUERY - helpers */


// get some property for a user without other reactive dependencies
// get single value using e.g. OtherUserProp('isAdmin') => Boolean
OtherUserProp = function(user, field, options) {
  
  // memorized
  var prop = _.isObject(user) ? pathValue(user, field) : undefined;
  if (!_.isUndefined(prop))
    return prop;
  
  var userId = _.isObject(user) ? user._id : user;
  var opt = {fields: _.object([field], [true])};
  user = Meteor.users.findOne(userId, _.extend(options || {}, opt));
  return pathValue(user, field); 
}

// pick some data from a user without all reactive dependencies
// get obj including fields using e.g. OtherUserProps(['isAdmin','city']) => {_id:..., city:... ,isAdmin:...}
OtherUserProps = function(user, fields, options) {

  // memorized
  if (_.isObject(user) && fields) {
    var userHasProp = function(field) { return !_.isUndefined(pathValue(user, field)); };
    if (_.all(_.union(['_id'], fields), userHasProp))
      return user;
  }

  var userId = _.isObject(user) ? user._id : user;
  var opt = {fields: _.object(fields, _.map(fields, function() { return true; }))};
  return Meteor.users.findOne(userId, _.extend(options || {}, opt));  
}

// get some property from Meteor.user() without other reactive dependencies
// get single value using e.g. UserProp('isAdmin') => Boolean
UserProp = function(field, options) {
  return OtherUserProp(Meteor.userId(), field, options);
}

// pick some data from Meteor.user() without all reactive dependencies
// get obj including fields using e.g. UserProps(['isAdmin','city']) => {_id:..., city:... ,isAdmin:...}
UserProps = function(fields, options) {
  return OtherUserProps(Meteor.userId(), fields, options)
}

UI.registerHelper('OtherUserProp', function(user, prop) {
  return OtherUserProp(user, prop);
});
UI.registerHelper('UserProp', function(prop) {
  return UserProp(prop);
});


/* permission helpers */

isAdmin = function(user) {
  user = user || Meteor.userId();
  return OtherUserProp(user, 'isAdmin');
}
isAmbassador = function(user, city) {
  if (_.contains(CITYKEYS, user)) {
    city = user;
    user = null;
  }
  user = user || Meteor.userId();
  city = city || (this['Session'] && Session.get('currentCity')) || UserProp('currentCity');
  return OtherUserProp(user, 'isAmbassador') && OtherUserProp(user, 'city') === city;
}
isOwner = function(user, doc) {
  if (!user) return false;
  if (!doc) {
    doc = user;
    user = Meteor.userId();
  }
  docUserId = _.isObject(doc) ? doc.userId : doc;
  var userId = _.isObject(user) ? user._id : user;
  return docUserId === userId;
}
hasAdminPermission = function(user) {
  return isAdmin(user);
}
hasAmbassadorPermission = function(user, city) {
  return hasAdminPermission(user) || isAmbassador(user, city);
}
hasOwnerPermission = function(user, doc) {
  if (!user) return false;
  if (!doc) {
    doc = user;
    user = Meteor.userId();
  }
  if (!_.isObject(doc)) return;

  if (doc.userId && isOwner(user, doc)) return true;
  else if (doc.city && isAmbassador(user, doc.city)) return true;
  else return isAdmin(user);
}
checkAdminPermission = function(user) {
  if (!hasAmbassadorPermission(user))
    throw new Meteor.Error(500, 'No privilege');
}
checkAmbassadorPermission = function(user, city) {
  if (!hasAmbassadorPermission(user, city))
    throw new Meteor.Error(500, 'No privilege');
}

UI.registerHelper('hasAmbassadorPermission', function() {
  return hasAmbassadorPermission();
})
UI.registerHelper('hasAdminPermission', function() {
  return hasAdminPermission();
})


/* data helpers */

userView = function(user, additionalFields) {
  user = OtherUserProps(user, _.union(['globalId','profile.name','profile.picture'], additionalFields || []));
  if (user) {
    user.foreign = userIsForeign(user) ? {foreign: "", disabled: ""} : '';
    user.label = userPictureLabel(user);
  }
  return user;
}

userIsForeign = function(user) {
  var city = OtherUserProp(user, 'city');
  return isForeignCity(city);
}


var _userRanks = {};
userRank = function(user) {
  user = user || Meteor.userId();
  var userId = _.isObject(user) ? user._id : user;

  // calculate
  if (!_userRanks[userId]) {
    var userCity = OtherUserProp(user, 'city', {reactive: false});
    var memo = function(user, i) { _userRanks[user._id] = i+1; };
    Users.find({city: userCity, isHidden: {$ne: true}}, {sort: {accessAt: 1}, fields: {_id: 1}, reactive: false}).forEach(memo);
  }

  // memo
  return _userRanks[userId];
}

userPictureLabel = function(user) {
  user = user || Meteor.userId();
  var userId = _.isObject(user) ? user._id : user;
  user = OtherUserProps(user, ['city','mergedWith','isDeleted','isAccessDenied','isHidden','isAmbassador','staff'])
  if (user.mergedWith)             return "merged with #"+userRank(user.mergedWith);
  if (user.isDeleted)              return "deleted";
  if (user.isAccessDenied)         return "no access";
  if (user.isHidden)               return "hidden";
  if (userIsForeign(userId))       return CITYMAP[user.city].name;
  if (user.isAmbassador)           return pathValue(user, 'staff.title'); // ambassador displayed as 'admin'
  else                             return "#"+userRank(user);
}

userStatusLabel = function(user) {
  user = user || Meteor.userId();
  user = OtherUserProps(user, undefined); // XXX TODO, SPECIFY fields
  var labels = [];

  var unverifiedEmail = !_.findWhere(user.emails, {address: user.profile.email, verified: true});
  if (user.isUninvited)         labels.push({style: 'important', text: 'not invited'});
  if (!user.profile.name)       labels.push({style: 'important', text: 'no name'});
  if (!user.profile.email)      labels.push({style: 'important', text: 'no email'});
  if (unverifiedEmail)          labels.push({style: 'important', text: 'email unverified'});
  if (user.isIncompleteProfile) labels.push({style: 'warning', text: 'incomplete profile'});
  if (user.isAccessDenied)      labels.push({style: 'warning', text: 'no access'});
  if (user.isHidden)            labels.push({style: 'warning', text: 'hidden'});
  if (user.isAdmin)             labels.push({style: 'success', text: 'admin'});
  if (user.isAmbassador)        labels.push({style: 'success', text: 'ambassador'});
  return labels;
}

userProfileUrl = function(user) {
  user = OtherUserProps(user, ['city','globalId']);
  var hash = Url.bitHash(user.globalId);
  return Url.replaceCity(user.city, Meteor.absoluteUrl(hash));
}

userInviteUrl = function(user) {
  user = user || Meteor.userId();
  var phrase = OtherUserProp(user, 'invitationPhrase');
  return Meteor.absoluteUrl('+/' + Url.bitHash(phrase));
}

userSocialName = function(user, service) {
  var socialUrl = OtherUserProp(user, 'profile.social.'+service)
  return socialNameFromUrl(service, socialUrl);
}

UI.registerHelper('UserView', function(user) {
  return userView(user);
});


UI.registerHelper('UserRank', function(user) {
  return userRank(user);
});

UI.registerHelper('UserSocialName', function(user, service) {
  return userSocialName(user, service);
});