


/* USERS */

// meteor allow users to update their public profiles
// other information can't be modified by default

Meteor.users.deny({
  insert: function(userId, doc) {
    return true; //DENY
  },
  remove: function(userId, doc) {
    return true; //DENY
  },
  update: function(userId, doc, fields, modifier) {

    // deny if user don't ownes this document
    if (!_.isEqual(userId, doc._id))
      return true; //DENY


    /* handle modifier */

    var allowedHackingValues = ['web','apps','software','game','design','life','hardware'];
    var allowedAvailableValues = ['drink','lunch'];
    var allowedSocialPictures = _.values(doc.profile.socialPicture);

    var $setPattern = {
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

    var $pushPattern = {
      "profile.hacking": Match.Optional(Match.In(allowedHackingValues)),
      "profile.available": Match.Optional(Match.In(allowedAvailableValues)),
      "profile.skills": Match.Optional(Match.In(SKILL_NAMES)),
      "profile.favoriteSkills": Match.Optional(Match.In(SKILL_NAMES))
    }

    // DENY if NO match
    return !(Match.test(modifier, {
      '$set': Match.Optional($setPattern),
      '$push': Match.Optional($pushPattern),
      '$addToSet': Match.Optional($pushPattern),
      '$pull': Match.Optional(Match.Any)
    }));
  },

  fetch: ['profile.socialPicture']
});



/* INVITATIONS */

// invitations are read only

Invitations.deny({
  remove: function() { return true; /* DENY */ },
  update: function() { return true; /* DENY */ },
  insert: function() { return true; /* DENY */ }
});





// helper functions

// check if user is allowed to access the site
// otherwise all database modifier functions will be blocked
var allowedAccess = function(userId) {
  var user = Meteor.users.findOne(userId);
  return user && user.allowAccess;
}
