
// ALLOW and DENY rules specifies which database queries are allowed
// and which not. This will be validated on the server

// shorthands (used below)
TRUE = function() { return true; }
FALSE = function() { return false; }
ALL = { insert: TRUE, update: TRUE, remove: TRUE };
NONE = { insert: FALSE, update: FALSE, remove: FALSE };



/* USERS */

// meteor allow users to update their public profiles
// other information can't be modified by default
Users.allow(ALL);
Users.deny({
  insert: TRUE, /* deny */
  remove: TRUE, /* deny */
  update: function(userId, doc, fields, modifier) {

    // deny if user don't ownes this document
    if (!_.isEqual(userId, doc._id))
      return true; /* deny */

    var allowedHackingValues = HACKING;
    var allowedAvailableValues = ['drink','lunch','email'];
    var allowedSocialPictures = _.values(doc.profile.socialPicture);

    var $setPattern = {
      'currentCity': Match.Optional(Match.Where(function(currentCity) {
        // currentCity must be identical to user's home city
        // only admins can change their visiting city
        return doc.isAdmin && _.contains(CITYKEYS, currentCity);
      })),
      'profile.email': Match.Optional(Match.Email),
      'profile.picture': Match.Optional(Match.In(allowedSocialPictures)),
      'profile.name': Match.Optional(Match.MinMax(1, 100, String)),
      "profile.location": Match.Optional({lat: Number, lng: Number}),
      "profile.homepage": Match.Optional(Match.Max(2100, String)),
      "profile.company": Match.Optional(Match.Max(100, String)),
      "profile.companyUrl": Match.Optional(Match.Max(2100, String)),
      "profile.hacking": Match.Optional(Match.AllIn(allowedHackingValues)),
      "profile.available": Match.Optional(Match.AllIn(allowedAvailableValues)),
      "profile.skills": Match.Optional(Match.AllIn(SKILL_NAMES)),
      "profile.favoriteSkills": Match.Optional(Match.AllIn(SKILL_NAMES))
    };

    var $unsetPattern = {
      'profile.location': Match.Optional(Match.Any)
    };

    var $pushPattern = {
      "profile.hacking": Match.Optional(Match.In(allowedHackingValues)),
      "profile.available": Match.Optional(Match.In(allowedAvailableValues)),
      "profile.skills": Match.Optional(Match.In(SKILL_NAMES)),
      "profile.favoriteSkills": Match.Optional(Match.In(SKILL_NAMES))
    }

    var $pullPattern = {
      "profile.hacking": Match.Optional(Match.Any),
      "profile.available": Match.Optional(Match.Any),
      "profile.skills": Match.Optional(Match.Any),
      "profile.favoriteSkills": Match.Optional(Match.Any)
    }

    return !Match.test(modifier, { /* deny if not valid */
      '$set': Match.Optional($setPattern),
      '$unset': Match.Optional($unsetPattern),
      '$push': Match.Optional($pushPattern),
      '$addToSet': Match.Optional($pushPattern),
      '$pull': Match.Optional($pullPattern)
    });

  },

  fetch: ['profile.socialPicture', 'isAdmin']
});





/* INVITATIONS */

Invitations.deny(ALL);






// helper functions

// check if user is allowed to access the site
// otherwise all database modifier functions will be blocked
allowedAccess = function(userId) {
  var user = Users.findOne(userId);
  return user && user.isAccessDenied != true;
}


