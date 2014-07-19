

// PUBLISH

if (Meteor.isServer) {

  // publishing collections to the client
  

  /* INVITATIONS */

  // Only publish invitation codes for the logged in user
  Meteor.publish("invitations", function (all) {
   
    if(!this.userId) 
      return [];

    // XXX in the future the admin page requires to fetch 
    // all invitations. Then do somehting with 'all'.
    
    return Invitations.find({$or: [ {broadcastUser: this.userId},
                                    {receivingUser: this.userId} ]});
  });





  
  /* USERS */

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
    "isHidden",
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

  // properties of the current logged in user that determine the user's permissions.
  // When one of these properties changes it affects the visible fields of other users.
  // So when an dependency changes, we have to republish the whole collection to test
  // each user doc against the new permission rights.
  var currentUserDependencies = [
    'isAccessDenied',
    'isAdmin',
    'city'
  ];

  Meteor.publish('userData', function() {
    var self = this;
    var currentUser = Users.findOne(this.userId);

    // don't publish hidden users except if that user is the current user
    var query = {$or: [{isHidden: {$ne: true}}, {_id: self.userId}]};

    // observe docs changes and push the changes to the client
    // only include fields that are allowed to publish, this can vary between users
    // and will be handled by the filetUserFields function.
    // In the case that one of the dependencies from current user's doc changes, we have
    // to republish the whole collection because then dependencies are evaluated again.
    var observeUserDocs = Users.find(query).observe({
      added: function(doc) {
        self.added('users', doc._id, filterUserFields(currentUser, doc, false));
      },
      changed: function(doc, oldDoc) {
        if (doc._id === self.userId) {
          currentUser = doc; // !!! changes STATE
          myDocChanged(doc, oldDoc);
        }
        self.changed('users', doc._id, filterUserFields(currentUser, doc, true));
      },
      removed: function(doc) {
        self.removed('users', doc._id);
      },
    });

    var myDocChanged = function(newDoc, oldDoc) {

      // check of one of the permission properties has changed
      var dependencyHasChanged = _.some(currentUserDependencies, function(prop) {
        return newDoc[prop] !== oldDoc[prop];
      });
      
      // if permission has changed, republish whole collection
      // to make sure all docs will be tested with this new permission
      if (dependencyHasChanged)
        republish();
    }
    
    var republish = function() {
      Users.find(query).forEach(function(doc) {
        self.changed('users', doc._id, filterUserFields(currentUser, doc, true));
      });
    }
    
    self.ready();
    
    self.onStop(function () {
      observeUserDocs.stop();
    });
  });






  
  // some complex publish helpers are defined here


  // determine which user fields to publish is more complex
  // it depends on the access level of the logged in user
  // and the privacy settings of the published user docs.

  var filterUserFields = function(currentUser, user, useUndefined) {
    
    // first determine current user's permission before continue.
    var hasAccess = currentUser && currentUser.isAccessDenied != true;
    var isSameCity = currentUser && cityMatch(currentUser.city, user.city);
    var isAdmin = currentUser && currentUser.isAdmin;
    var isAmbassador = currentUser && currentUser.ambassador;


    // holds which fields to publish        
    var useFields = [];

    
    // publish this data of all users anyway
    useFields.push(userFieldsGlobal);
    
    if (user.ambassador)
      useFields.push(userFieldsAmbassador);

    
    // publish this data only if
    // current user has access to the site
    // and the published user is in the same city
    if (hasAccess && isSameCity) {
      useFields.push(userFieldsData);
      
      // only publish e-mailadresses of user who accepted that
      if (user.profile && user.profile.available && user.profile.available.length)
        useFields.push(userFieldsEmail);
    }


    // publish all data of CurrentUser
    if (currentUser && currentUser._id === user._id) {
      useFields.push(userFieldsData);
      useFields.push(userFieldsEmail);
      useFields.push(userFieldsCurrentUser);
    }


    // publish available fields with Ambassador permission
    if (isAmbassador && isSameCity) {
      useFields.push(userFieldsData); // include userdata
      useFields.push(userFieldsEmail); // include e-mail
    }


    // publish available fields with Admin permission 
    if (isAdmin) {
      useFields.push(userFieldsData); // include userdata
      useFields.push(userFieldsEmail); // include e-mail
    }


    
    // returning the user doc with only visible fields included
    // this doc is send to the client and only may contain the data
    // that the logged in user is allowed to see from this user doc.
    // mark all other fields as undefined, to make sure they will me removed from client db

    var undefinedUser = {};
    _.each(allUserFields, function(field) { 
      _.deep(undefinedUser, field, undefined); 
    });
    
    var publishUser = _.deepPick(user, _.union.apply(this, useFields));
    
    return useUndefined ? _.extend(undefinedUser, publishUser) : publishUser;
  }










  // helper functions

  // check if user is allowed to access the site
  // otherwise all database modifier functions will be blocked
  var allowedAccess = function(userId) {
    var user = Users.findOne(userId);
    return user && user.isAccessDenied != true;
  }

  var cityMatch = function(city1, city2) {
    return city1 && city2 && city1 === city2;
  }


  // // return an uniform list of userIds
  // // valid input can be:
  // // 1. some userId string "..."
  // // 2. some object {city: ..., localRank: ...}
  // // 3. some array with either values from 1 or 2
  // var uniformUserIds = function(users) {
  //   if (users === 'all') 
  //     return 'all';
    
  //   if (_.isArray(users))
  //     users = _.map(users, _uniformUserIds);
  //   else 
  //     users = [ _uniformUserIds(users) ];
    
  //   return _.compact(users);
  // }

  // var _uniformUserIds = function(user) {
  //   if (Match.test(user, String)) // passed in a single userId
  //     return user;
  //   if (Match.test(user, {city: String, localRank: Number})) // passed in a single localRank
  //     if (user = Meteor.users.findOne(user)) 
  //       return user._id;
  //   return null;
  // }



}