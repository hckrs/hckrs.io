


/* USERS */

// meteor allow users to update their public profiles
// other information can't be modified by default

Meteor.users.deny({ //DENY
  insert: function(userId, doc) {
    return true; //deny
  },
  remove: function(userId, doc) {
    return true; //deny
  },
  update: function(userId, doc, fields, modifier) {
      
    // deny if user don't ownes this document
    if (!_.isEqual(userId, doc._id))
      return true; //deny


    /* handle modifier */

    var allowedHackingValues = ['web','apps','software','game','design','life','hardware'];
    var allowedAvailableValues = ['drink','lunch'];
    var allowedSocialPictures = _.values(doc.profile.socialPicture);

    var $setPattern = {
      'profile.email': Match.Optional(String),
      'profile.picture': Match.Optional(Match.In(allowedSocialPictures)),
      'profile.name': Match.Optional(String),
      "profile.location": Match.Optional({lat: Number, lng: Number}),
      "profile.homepage": Match.Optional(String),
      "profile.company": Match.Optional(String),
      "profile.companyUrl": Match.Optional(String),
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

    // TODO XXX: Make sure that they can not insert large amount 
    // of data to their profiles or set large pictures.
    // TODO XXX: extend rules for other operators


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







/* default checking */
//
// var defaultChecking = function() {
//   var allowedFields = [
//     "profile.picture",
//     "profile.name",
//     "profile.location",
//     "profile.homepage",
//     "profile.company",
//     "profile.companyUrl",
//     "profile.hacking",
//     "profile.available",
//     "profile.skills",
//     "profile.favoriteSkills"
//   ];

//   // extract top level fields from specified allowed fields
//   var allowedTopLevelFields = _.uniq(_.map(allowedFields, function(field) {
//     return field.split('.')[0];
//   }));
  
//   // deny if user changing a top level field other than specified in allowedFields
//   if (!allIn(fields, allowedTopLevelFields))
//     return true; //deny

//   // deny if using other operators then '$set'
//   if (!allIn(_.keys(modifier), allowedOperators))
//     return true; //deny      

//   // deny if user don't ownes this document
//   if (!_.isEqual(userId, doc._id))
//     return true; //deny
// }