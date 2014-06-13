

// PUBLISH

if (Meteor.isServer) {

  // publishing collections to the client
  

  /* USER DATA */

  // we define multiple publish rules for userdata.
  // the priority of rules is from top to bottom
  // 1. current logged in user
  // 2. users with public e-mailaddress
  // 3. otherwise only the default public user data is published
  // when a user match a rule it will directly published with the specified 
  // fields. The lower rules are not evaluated further for that user.
  // on the client you must subscribe all publish rules.
  // note: we not publish all users, only the ones that are allowed to access

  var globalPublicUserFields = {
    "city": true,
    "localRank": true,
    "globalRank": true,
    "profile.name": true,
    "profile.picture": true,
  }

  var publicUserFields = _.extend(_.clone(globalPublicUserFields), {
    "createdAt": true,
    "profile.location": true,
    "profile.homepage": true,
    "profile.company": true,
    "profile.companyUrl": true,
    "profile.hacking": true,
    "profile.available": true,
    "profile.social": true,
    "profile.skills": true,
    "profile.favoriteSkills": true

    // DON'T INCLUDE
    // "profile.socialPicture": true,
  });

  var publicUserFieldsEmail = _.extend(_.clone(publicUserFields), {
    "profile.email": true
  });

  var publicUserFieldsCurrentUser = _.extend(_.clone(publicUserFieldsEmail), {
    "isAdmin": true,
    "isMayor": true,
    "isAccessDenied": true,
    "isUninvited": true,
    "isIncompleteProfile": true,
    "isHidden": true,
    "invitations": true,
    "invitationPhrase": true,
    "profile.socialPicture": true,
    "emails": true
  });


  // 1. current logged in user
  // publish additional fields 'emails' and 'profile' for the current user
  Meteor.publish("publicUserDataCurrentUser", function (currentUser) {
    // ignore 'currentUser' and use the secure 'this.userId' instead
    if(!this.userId)
      return [];
    
    var selector = {
      "_id": this.userId
    };
    return Users.find(selector, {fields: publicUserFieldsCurrentUser});
  });

  // 2. users with public e-mailaddress
  // we make emailaddresses public of the users that are available for drink/lunch
  // publish their public information including emailaddress
  Meteor.publish("publicUserDataEmail", function (userIds) {
    var user = Users.findOne(this.userId);
    userIds = uniformUserIds(userIds);

    if(!user || !allowedAccess(user._id) || !user.city)
      return []; 
    
    var selector = {
      "_id": userIds === "all" ? {$exists: true} : {$in: userIds},
      "city": user.city,
      "profile.available": {$exists: true, $not: {$size: 0}}, 
      "isHidden": {$ne: true}, 
    };
    return Users.find(selector, {fields: publicUserFieldsEmail}); 
  });

  // 3. otherwise only the default public user data is published
  // publish all public profile data of all users
  Meteor.publish("publicUserData", function (userIds) {
    var user = Users.findOne(this.userId);
    userIds = uniformUserIds(userIds);

    if(!user || !allowedAccess(user._id) || !user.city)
      return [];   
    
    var selector = {
      "_id": userIds === "all" ? {$exists: true} : {$in: userIds},
      "city": user.city,
      "isHidden": {$ne: true},
    }
    return Users.find(selector, {fields: publicUserFields}); 
  });

  // 4. always publish global user information for everyone (even if not logged in)
  Meteor.publish("publicUsers", function (hash) {
    var selector = {
      "isHidden": {$ne: true},
    };
    return Users.find(selector, {fields: globalPublicUserFields});  
  });



  



  /* INVITATIONS */

  // Only publish invitation codes for the logged in user
  Meteor.publish("invitations", function (hash) {
   
    if(!this.userId) 
      return [];
    
    return Invitations.find({});
  });



  /* HIGHLIGHTS */

  // Only publish highlights for the city of the logged in user
  Meteor.publish("highlights", function () {
    var user = Users.findOne(this.userId);

    if(!user || !allowedAccess(user._id))
      return [];   

    return Highlights.find({city: user.city});
  });





  // helper functions

  // check if user is allowed to access the site
  // otherwise all database modifier functions will be blocked
  var allowedAccess = function(userId) {
    var user = Users.findOne(userId);
    return user && user.isAccessDenied != true;
  }


  // return an uniform list of userIds
  // valid input can be:
  // 1. some userId string "..."
  // 2. some object {city: ..., localRank: ...}
  // 3. some array with either values from 1 or 2
  var uniformUserIds = function(users) {
    if (_.isArray(users))
      users = _.map(users, _uniformUserIds);
    else 
      users = [ _uniformUserIds(users) ];
    return _.compact(users);
  }

  var _uniformUserIds = function(user) {
    if (Match.test(user, String)) // passed in a single userId
      return user;
    if (Match.test(user, {city: String, localRank: Number})) // passed in a single localRank
      if (user = Meteor.users.findOne(user)) 
        return user._id;
    return null;
  }



}