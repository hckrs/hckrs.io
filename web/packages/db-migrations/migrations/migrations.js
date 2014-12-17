// Database Migrations
//
// When changing the model the existing database must fit the new model
// Create a migration that transforms the data into this new model. 
// (XXX Note that a migration task can run multiple times in case of a failure ???)
//
// The server detects automatically on startup which migrations needs to run


migrations = [

  { // 21 dec 2013
    name: "Hidden accounts",
    task: function(callback) {
      
      // change (allowAccess & isInvited) to isAccessDenied
      Meteor.users.update({$or: [{allowAccess: {$ne: true}}, {isInvited: {$ne: true}}]}, {$set: {isAccessDenied: true, isHidden: true}}, {multi: true, validate: false});

      // unset allowAccess
      Meteor.users.update({}, {$unset: {allowAccess: true}}, {multi: true, validate: false});

      // unset isInvited
      Meteor.users.update({}, {$unset: {isInvited: true}}, {multi: true, validate: false});  
      
      // hide deleted accounts
      Meteor.users.update({isDeleted: true}, {$set: {isHidden: true}}, {multi: true, validate: false});      

      // make users with localRank===1 mayor
      Meteor.users.update({localRank: 1}, {$set: {isMayor: true}}, {multi: true, validate: false});      

      // done
      callback();
    }
  },

  { // 23 dec 2013
    name: "Complete your profile",
    task: function(callback) {
      
      // change (allowAccess & isInvited) to isAccessDenied
      Meteor.users.update({isAccessDenied: true}, {$set: {isIncompleteProfile: true}}, {multi: true, validate: false});

      // done
      callback();
    }
  },

  { // 8 feb 2014
    name: "Uninvited",
    task: function(callback) {

      // change not invited users to isUninvited excepts Mayors
      
      Meteor.users.find().forEach(function(user) {
        var isInvited = !!(user.isMayor || Invitations.findOne({ receivingUser: user._id }));
        if (!isInvited)
          Meteor.users.update(user._id, {$set: {isUninvited: true, isAccessDenied: true, isHidden: true}}, {validate: false});
      });

      // done
      callback();
    }
  },

  { // 21 jun 2014
    name: "Multicity with Ambassadors",
    task: function(callback) {

      Meteor.users.update({}, {$set: {city: "lyon"}}, {multi: true, validate: false});
      Meteor.users.update({isMayor: true}, {$unset: {isMayor: true}, $set: {ambassador: {city: "lyon"}}}, {multi: true, validate: false});

      // move user Jarno to city Utrecht (no ambassador)
      Meteor.users.update("ZRYjqoG48R895CiDZ", {$unset: {ambassador: true, isHidden: true}, $set: {city: "utrecht", localRank: 1}}, {validate: false});

      // move user Daan to enschede and make him ambassador
      Meteor.users.update("3mbb7xSWpJoNxsygf", {$set: {city: "enschede", localRank: 1, ambassador: {city: "enschede"}}}, {validate: false});

      // done
      callback();

    }
  },

  { // 29 juli 2014
    name: "Simple Schema",
    task: function(callback) {

      // add field 'currentCity' to all users
      Users.find().forEach(function(user) {
        Users.update(user._id, {
          $set: {
            globalId: user.globalRank,
            currentCity: user.city,
            accessAt: user.isAccessDenied ? undefined : user.createdAt,
            isAmbassador: user.ambassador ? true : undefined,
            ambassador: user.ambassador ? _.pick(user.ambassador, 'title') : undefined,
          }, 
          $unset: {
            localRank: true,
            globalRank: true
          }
        }, {validate: false});
      });

      // rename field signedupAt to 'createdAt' for all invitations
      Invitations.find().forEach(function(invitation) {
        Invitations.update(invitation._id, {$set: {createdAt: invitation.signedupAt}, $unset: {signedupAt: true}}, {validate: false})
      });

      // add global attribute to highlights + rename url
      Highlights.find().forEach(function(highlight) {
        Highlights.update(highlight._id, {$set: {global: false, url: highlight.website}, $unset: {website: true}}, {validate: false});
      });
      
      // add field 'createdAt' to migrations
      Migrations.find().forEach(function(migration) {
        Migrations.update(migration._id, {$set: {createdAt: migration.processedAt}}, {validate: false});
      });

      // done
      callback();
    }
  },

  { // 1 sep 2014
    name: "Simple Schema - private attribute",
    task: function(callback) {
      // rename global attribute to private

      Highlights.find().forEach(function(highlight) {
        Highlights.update(highlight._id, {$unset: {global: true}, $set: {private: !highlight.global}}, {validate: false});
      });
      Places.find().forEach(function(place) {
        Places.update(place._id, {$unset: {global: true}, $set: {private: !place.global}}, {validate: false});
      });
      Deals.find().forEach(function(deal) {
        Deals.update(deal._id, {$unset: {global: true}, $set: {private: !deal.global}}, {validate: false});
      });

      // done
      callback();
    }
  },

  { // 7 sep 2014
    name: "Ambassador",
    task: function(callback) {

      // set ambassadors e-mailadress default to "mail@hckrs.io"
      Meteor.users.update({isAmbassador: true}, {$set: {ambassador: {title: "admin", email: ""}}}, {multi: true, validate: false});

      // done
      callback();
    }
  },

  { // 7 sep 2014
    name: "Mailings",
    task: function(callback) {

      var initial_mailings = _.chain(MAILING_OPTIONS).where({checked: true}).pluck('value').value();

      // subscribe users to initial mailing lists
      Meteor.users.update({}, {$set: {mailings: initial_mailings}}, {multi: true, validate: false})

      // done
      callback();
    }
  },

  { // 9 sep 2014
    name: "Ambassador emails",
    task: function(callback) {

      // set ambassador email
      Meteor.users.update({_id: "eKbavA5AyWWjPB9LT"}, {$set: {"ambassador.email": "toon@hckrs.io"}}, {validate: false});
      Meteor.users.update({_id: "ZRYjqoG48R895CiDZ"}, {$set: {ambassador: {title: "admin", email: "jarno@hckrs.io"}}}, {validate: false});

      // done
      callback();
    }
  },

  { // 11 sep 2014
    name: "Rename ambassador to staff",
    task: function(callback) {

      // set ambassador email
      Users.find({ambassador: {$exists: true}}).forEach(function(ambassador) {
        Users.update(ambassador._id, {$set: {staff: ambassador.ambassador}, $unset: {ambassador: true}}, {validate: false});
      });

      // done
      callback();
    }
  },

  

];


