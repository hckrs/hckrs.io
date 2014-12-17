

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