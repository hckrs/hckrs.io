Meteor.startup(function() {
  // collections are defined at this point
  // now we can set ALLOW and DENY rules


  /* USERS */

  // meteor allow users to update their public profiles
  // other information can't be modified by default

  Users.deny({
    insert: TRUE, /* deny */
    remove: TRUE, /* deny */
    update: function(userId, doc, fields, modifier) {

      // deny if user don't ownes this document
      if (!_.isEqual(userId, doc._id))
        return true; /* deny */

      var allowedHackingValues = ['web','apps','software','game','design','life','hardware','opensource'];
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

      return !Match.test(modifier, { /* deny if not valid */
        '$set': Match.Optional($setPattern),
        '$unset': Match.Optional($unsetPattern),
        '$push': Match.Optional($pushPattern),
        '$addToSet': Match.Optional($pushPattern),
        '$pull': Match.Optional($pullPattern)
      });

    },

    fetch: ['profile.socialPicture']
  });


  // before update
  Users.before.update(function(userId, doc, fieldNames, modifier, options) {

    // make sure that urls start with http:// or https://
    if (modifier.$set && modifier.$set['profile.homepage'])
      modifier.$set['profile.homepage'] = externUrl(modifier.$set['profile.homepage']);
    if (modifier.$set && modifier.$set['profile.companyUrl'])
      modifier.$set['profile.companyUrl'] = externUrl(modifier.$set['profile.companyUrl']);

    return modifier;
  });


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



  /* INVITATIONS */
  
  // invitations are read only
  
  Invitations.deny(ALL);



  /* GOOD-STUFF */

  GoodStuffItems.allow({
    update: FALSE,
    remove: FALSE,
    insert: function(userId, doc) { 
      return Match.test(doc, {
        '_id': String,
        'title': String,
        "website": Match.URL,
        "color": {
          "r": Number, 
          "g": Number, 
          "b": Number
        },
        'imageUrl': Match.Optional(Match.URL),
        "subtitle": Match.Optional(String),
        "description": Match.Optional(String),
        "eventLocation": Match.Optional(String),
        "eventDate": Match.Optional(Date),
        "costs": Match.Optional(Number), 
      });
    }
  });

  // before update
  GoodStuffItems.before.insert(function(userId, doc) {
    doc.createdAt = newDate();
    doc.userId = userId;
    return doc;
  });



});


// helper functions

// check if user is allowed to access the site
// otherwise all database modifier functions will be blocked
var allowedAccess = function(userId) {
  var user = Users.findOne(userId);
  return user && user.isAccessDenied != true;
}

var TRUE = function() { return true; }
var FALSE = function() { return false; }

// allow ALL helper can be used
// to define only deny checks
var ALL = {
  insert: TRUE,
  update: TRUE,
  remove: TRUE,
}

// allow NONE has no useful functionality
// but explicit writing it down make it more clear
var NONE = {
  insert: FALSE,
  update: FALSE,
  remove: FALSE, 
}
