
/* Permissions */

// meteor allow users to update their public profiles therefore we need to
// specify DENY rules for the user collection to overwrite meteor rules.

Users.allow(Permissions.ALL);
Users.deny({
  fetch: ['profile.socialPicture', 'city'],
  insert: Permissions.TRUE, /* deny */
  remove: Permissions.TRUE, /* deny */
  update: function(userId, doc, fields, modifier) {

    var userPermission = [
      'updatedAt',
      'profile.email',
      'profile.skype',
      'profile.phone',
      'profile.picture',
      'profile.name',
      "profile.location",
      "profile.location.lat",
      "profile.location.lng",
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
      'isAdmin',
      'staff',
      'staff.title',
      'staff.email',
    ];

    // determine the permissions of user who edit this doc
    var fields = [];
    if (Users.hasAdminPermission())  // admin
      fields = _.union(userPermission, ambassadorPermission, adminPermission);
    else if (Users.hasAmbassadorPermission(userId, doc.city)) // ambassador
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

    // test against user schema
    if (!Schemas.User.newContext().validate(modifier, {modifier: true}))
      return true; /* DENY */
  }
});


    
