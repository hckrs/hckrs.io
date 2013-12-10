


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
    var allowedAvailableValues = ['drink','lunch','email'];
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

    var match = Match.test(modifier, {
      '$set': Match.Optional($setPattern),
      '$unset': Match.Optional($unsetPattern),
      '$push': Match.Optional($pushPattern),
      '$addToSet': Match.Optional($pushPattern),
      '$pull': Match.Optional($pullPattern)
    });

    // pattern matching
    if (!match) 
      return true; //DENY


    /* 
      handle new e-mailaddress 
      insert into user's emails array 
      and send a verification e-mail
    */
    if (modifier.$set && modifier.$set['profile.email']) {
      var email = modifier.$set['profile.email'];
      var user = Meteor.users.findOne(userId);
      var emails = user.emails;
      var found = _.findWhere(emails, {address: email});

      // insert new e-mail
      if (!found)
        Meteor.users.update(userId, {$push: {'emails': {'address': email, verified: false}}});

      // verify e-mailaddres, by sending a verification e-mail
      // user will be temporary disallowed to enter the site
      if (!found || !found.verified) { 
        Accounts.sendVerificationEmail(userId, email);
        Meteor.users.update(userId, {$set: {'allowAccess': false}});
      }

      // remove previous mailaddress
      Meteor.setTimeout(_.partial(cleanEmailAddress, userId), 2000);
    }



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
