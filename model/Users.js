
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
  "profile.picture": {  // url of an avatar for this user
    type: String
  },    
  
  "profile.location": {  // workplace (school / company)
    type: Object,
    optional: true
  },
  "profile.location.lat": { // latitude
    type: Number,
    decimal: true
  },
  "profile.location.lng": { // longitude
    type: Number,
    decimal: true
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
    allowedValues: ['drink','lunch','email'],
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
  "localRank": {        // assigned hacker number based on signup order in city
    type: Number
  },   
  "globalRank": {       // assigned hacker number based on signup order of all world hackers
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


  /* administration details */

  "ambassador": {       // only when user is ambassador    
    type: Object,
    optional: true,
  },
  "ambassador.title": { // custom title of this ambassador     
    type: String,
    optional: true         
  },
  "ambassador.city": {  // refer to the city where this user is ambassor
    type: String
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
weakSchema['localRank'] = {optional: true};
weakSchema['globalRank'] = {optional: true};
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

// meteor allow users to update their public profiles
// therefore we need the DENY rules for the user collection.

Users.allow(ALL);
Users.deny({
  fetch: ['profile.socialPicture', 'city'],
  insert: TRUE, /* deny */
  remove: TRUE, /* deny */
  update: function(userId, doc, fields, modifier) {

    var userPermission = [
      'updatedAt',
      'profile.email',
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
    ];

    var ambassadorPermission = [
      'invitations'
    ];

    var adminPermission = [
      'currentCity'
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
    "localRank",
    "globalRank",
    "invitationPhrase",
    "profile.name",
    "profile.picture",
    "isHidden",
    "isAccessDenied",
    "isDeleted",
    "mergedWith",
  ];
  var userFieldsData = [
    "createdAt",
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
  var userFieldsEmail = [
    "profile.email",
  ];
  var userFieldsAmbassador = [
    "ambassador",
    "profile.email",
    "profile.social",
  ];
  var userFieldsCurrentUser = [
    "isAdmin",
    "isAccessDenied",
    "isUninvited",
    "isIncompleteProfile",
    "invitations",
    "profile.socialPicture",
    "emails",
  ];

  var allUserFields = _.union(
    userFieldsGlobal, 
    userFieldsData, 
    userFieldsEmail, 
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
    'ambassador'
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
    var isAmbassador = permissions.ambassador;


    // holds which fields to publish        
    var useFields = [];

    
    // publish this data of all users anyway
    useFields.push(userFieldsGlobal);
    
    if (doc.ambassador)
      useFields.push(userFieldsAmbassador);

    
    // publish this data only if
    // current user has access to the site
    // and the published user is in the same city
    if (hasAccess && isSameCity) {
      useFields.push(userFieldsData);
      
      // only publish e-mailadresses of user who accepted that
      if (doc.profile && doc.profile.available && doc.profile.available.length)
        useFields.push(userFieldsEmail);
    }

    // include all user data when logged in as admin or ambassador
    // and also for the logged in user itself.
    if (isAdmin || 
        (isAmbassador && isSameCity) || 
        (permissions && permissions._id === doc._id)) {
      useFields.push(userFieldsData); // include user data
      useFields.push(userFieldsEmail); // include e-mail
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

    /* 
      handle new e-mailaddress 
      insert into user's emails array 
      and send a verification e-mail
    */

    if (modifier.$set && modifier.$set['profile.email']) {
      var email = modifier.$set['profile.email'];
      var user = Users.findOne(userId);
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

      // remove previous mailaddress
      Meteor.setTimeout(_.partial(cleanEmailAddress, userId), 10000);
    }
  });
}




/* QUERY - helpers */


// get some property for a user without other reactive dependencies
// get single value using e.g. OtherUserProp('isAdmin') => Boolean
OtherUserProp = function(userId, field, options) {
  var opt = {fields: _.object([field], [true])};
  var user = Meteor.users.findOne(userId, _.extend(options || {}, opt));
  return pathValue(user, field); 
}

// pick some data from a user without all reactive dependencies
// get obj including fields using e.g. OtherUserProps(['isAdmin','city']) => {_id:..., city:... ,isAdmin:...}
OtherUserProps = function(userId, fields, options) {
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

UI.registerHelper('OtherUserProp', function(userId, prop) {
  return OtherUserProp(userId, prop);
});
UI.registerHelper('UserProp', function(prop) {
  return UserProp(prop);
});


/* permission helpers */

isAdmin = function(userId) {
  userId = userId || Meteor.userId();
  return OtherUserProp(userId, 'isAdmin');
}
isAmbassador = function(userId, city) {
  userId = userId || Meteor.userId();
  city = city || (Session && Session.get('currentCity')) || UserProp('currentCity');
  return !!OtherUserProp(userId, 'ambassador') && OtherUserProp(userId, 'city') === city;
}
hasAdminPermission = function(userId) {
  return isAdmin(userId);
}
hasAmbassadorPermission = function(userId, city) {
  return hasAdminPermission(userId) || isAmbassador(userId, city);
}
checkAdminPermission = function(userId) {
  if (!hasAmbassadorPermission(userId))
    throw new Meteor.Error(500, 'No privilege');
}
checkAmbassadorPermission = function(userId) {
  if (!hasAmbassadorPermission(userId))
    throw new Meteor.Error(500, 'No privilege');
}

UI.registerHelper('hasAmbassadorPermission', function() {
  return hasAmbassadorPermission();
})
UI.registerHelper('hasAdminPermission', function() {
  return hasAdminPermission();
})


/* data helpers */

userView = function(userId, additionalFields) {
  var user = OtherUserProps(userId, _.union(['profile.name','profile.picture'], additionalFields || []));
  if (user) {
    user.foreign = userIsForeign(userId) ? {foreign: "", disabled: ""} : '';
    user.label = userPictureLabel(userId);
  }
  return user;
}

userIsForeign = function(userId) {
  var city = OtherUserProp(userId, 'city');
  return isForeignCity(city);
}

userPictureLabel = function(userId) {
  userId = userId || Meteor.userId();
  var user = OtherUserProps(userId, ['city','localRank','mergedWith','isDeleted','isAccessDenied','isHidden','ambassador'])
  if (user.mergedWith)             return "Merged with #"+OtherUserProp(user.mergedWith, 'localRank');
  if (user.isDeleted)              return "Deleted";
  if (user.isAccessDenied)         return "No Access";
  if (user.isHidden)               return "Hidden";
  if (userIsForeign(userId))       return CITYMAP[user.city].name;
  if (user.ambassador)             return "Ambassador";
  else                             return "#"+user.localRank;
}

userSocialName = function(userId, service) {
  var socialUrl = OtherUserProp(userId, 'profile.social.'+service)
  return socialNameFromUrl(service, socialUrl);
}

UI.registerHelper('UserView', function(userId) {
  return userView(userId);
});

