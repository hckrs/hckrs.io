
/* Publish */

// Publish the users to the client. A detailed specification of
// which fields will be published is given here


// all users will be published, but which fields are includes can vary along users.
// which fields to include is difficult logic because of conditions/dependencies,
// it depends on the access level of the logged in user
// and the privacy settings of the published user docs.
// this will be handled by the filterUserFields function

// exported user fields
UserFields = {
  // properties of the current logged in user that determine the user's permissions (in filterUserFields()).
  // When one of these properties changes it affects the visible fields of other users.
  // So when an dependency changes, we have to republish the whole collection to test
  // each user doc against the new permission rights.
  // Only first-level properties are allowed, such as 'profile', but NOT 'profile.name'
  permissionDeps: [
    '_id',
    'isAccessDenied',
    'isAdmin',
    'city',
    'currentCity',
    'isAmbassador'
  ]
}

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
  "staff",
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

// publish all fields of the logged in user
Meteor.publish(null, function() {
  var fields = {
    "services": 0
  }
  return !this.userId ? [] : Users.find({_id: this.userId}, {fields: fields, limit: 1});
});


// publish specific fields of all users
Meteor.publish('users', function(city) {
  var self = this;
  var queryOptions = {fields: Query.fieldsArray(allUserFields)};

  // initial permissions (can be changed below)
  var permissions = Users.findOne(this.userId, {fields: Query.fieldsArray(UserFields.permissionDeps)}) || {};

  var selector = {};

  if(!permissions || !Users.allowedAccess(permissions))
    return [];

  if (typeof city === 'string' && (permissions.city === city || Users.isAdmin(permissions))) {
    selector.city = city;
  }
  else { // not allowed to see users of city
    return [];
  }

  // observe docs changes and push the changes to the client
  // only include fields that are allowed to publish, this can vary between users
  // and will be handled by the filterUserFields() function.
  var observer = Users.find(selector, queryOptions).observe({
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
    Users.find(selector, queryOptions).forEach(function(doc) {
      self.changed('users', doc._id, excludeUserFields(permissions, doc, false));
    });
  }

  // Check if depended permissions fields from current user changes
  // if so, we have to republish the whole user collection
  if (self.userId)
    var myObserver = Users.find({_id: self.userId}, {fields: Query.fieldsArray(UserFields.permissionDeps)}).observe({'changed': republish});


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

    var available = Object.property(doc, 'profile.available') || [];

    // only publish e-mailadresses of user who accepted that
    if (Array.someIn(['drink','lunch','email','cowork','couchsurf'], available))
      useFields.push(userFieldsEmail);

    // only publish phone/skype information of user who accepted that
    if (Array.someIn(['call', 'couchsurf'], available))
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
