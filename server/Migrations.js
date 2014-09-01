// Database Migrations
//
// When changing the model the existing database must fit the new model
// Create a migration that transforms the data into this new model. 
// (XXX Note that a migration task can run multiple times in case of a failure ???)
//
// The server detects automatically on startup which migrations needs to run


var migrations = [

  { // 21 dec 2013
    name: "Hidden accounts",
    task: function(callback) {
      
      // change (allowAccess & isInvited) to isAccessDenied
      Meteor.users.update({$or: [{allowAccess: {$ne: true}}, {isInvited: {$ne: true}}]}, {$set: {isAccessDenied: true, isHidden: true}}, {multi: true});

      // unset allowAccess
      Meteor.users.update({}, {$unset: {allowAccess: true}}, {multi: true});

      // unset isInvited
      Meteor.users.update({}, {$unset: {isInvited: true}}, {multi: true});  
      
      // hide deleted accounts
      Meteor.users.update({isDeleted: true}, {$set: {isHidden: true}}, {multi: true});      

      // make users with localRank===1 mayor
      Meteor.users.update({localRank: 1}, {$set: {isMayor: true}}, {multi: true});      

      // done
      callback();
    }
  },

  { // 23 dec 2013
    name: "Complete your profile",
    task: function(callback) {
      
      // change (allowAccess & isInvited) to isAccessDenied
      Meteor.users.update({isAccessDenied: true}, {$set: {isIncompleteProfile: true}}, {multi: true});

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
          Meteor.users.update(user._id, {$set: {isUninvited: true, isAccessDenied: true, isHidden: true}});
      });

      // done
      callback();
    }
  },

  { // 21 jun 2014
    name: "Multicity with Ambassadors",
    task: function(callback) {

      Meteor.users.update({}, {$set: {city: "lyon"}}, {multi: true});
      Meteor.users.update({isMayor: true}, {$unset: {isMayor: true}, $set: {ambassador: {city: "lyon"}}}, {multi: true});

      // move user Jarno to city Utrecht (no ambassador)
      Meteor.users.update("ZRYjqoG48R895CiDZ", {$unset: {ambassador: true, isHidden: true}, $set: {city: "utrecht", localRank: 1}});

      // move user Daan to enschede and make him ambassador
      Meteor.users.update("3mbb7xSWpJoNxsygf", {$set: {city: "enschede", localRank: 1, ambassador: {city: "enschede"}}});

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
  }

];






// run a specific migration
var runMigration = function(migration, callback) {

  // start
  Migrations.insert({name: migration.name, status: 'inProgress', processedAt: new Date()});
  log('TASK:', migration.name);

  // process
  migration.task(function(err) {
  
    if (err) 
      return callback(err);
    
    // finishing
    Migrations.update({name: migration.name}, {$set: {status: 'done', processedAt: new Date()}});

    // successful migrated
    callback();
  });
}



// run required migrations on startup
Meteor.startup(function() {

  var allDone = _.every(migrations, function(migration) {
    var processed = Migrations.findOne({name: migration.name});
    return processed && processed.status === 'done';
  });
  
  if (!allDone) {
  
    log("BEGIN MIGRATIONS")  

    // loop through migration
    async.eachSeries(migrations, function(migration, callback) {
        
      // check if migration is already processed
      var processed = Migrations.findOne({name: migration.name});
      
      if (!processed) { //run
        runMigration(migration, callback); 
      } else if (processed.status === 'done') { //already done
        callback(); 
      } else { //error
        callback("Migration '" + migration.name + "' not finished previous time.")
      }

    }, function(err) {
      if (err) 
        log("[Migration Error]", err);
      else
        log("END MIGRATIONS")
    });

  }
});