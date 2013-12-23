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
      log('1/5');

      // unset allowAccess
      Meteor.users.update({}, {$unset: {allowAccess: true}}, {multi: true});
      log('2/5');

      // unset isInvited
      Meteor.users.update({}, {$unset: {isInvited: true}}, {multi: true});  
      log('3/5');
      
      // hide deleted accounts
      Meteor.users.update({isDeleted: true}, {$set: {isHidden: true}}, {multi: true});      
      log('4/5');

      // make users with localRank===1 mayor
      Meteor.users.update({localRank: 1}, {$set: {isMayor: true}}, {multi: true});      
      log('5/5');

      // done
      callback();
    }
  },

  { // 23 dec 2013
    name: "Complete your profile",
    task: function(callback) {
      
      // change (allowAccess & isInvited) to isAccessDenied
      Meteor.users.update({isAccessDenied: true}, {$set: {isIncompleteProfile: true}}, {multi: true});
      log('1/1');

      // done
      callback();
    }
  },

];







// run a specific migration
var runMigration = function(migration, callback) {

  // start
  Migrations.insert({name: migration.name, status: 'inProgress', processedAt: new Date()});
  log('Running migration:', migration.name);

  // process
  migration.task(function(err) {
  
    if (err) 
      return callback(err);
    
    // finishing
    Migrations.update({name: migration.name}, {$set: {status: 'done', processedAt: new Date()}});
    log('Finishing migration:', migration.name);

    // successful migrated
    callback();
  });
}



// run required migrations on startup
Meteor.startup(function() {
  
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
    if (err) log("[Migration Error]", err);
  });

});