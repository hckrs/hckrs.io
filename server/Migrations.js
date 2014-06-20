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

  { // 8 feb 2014
    name: "Uninvited",
    task: function(callback) {

      // change not invited users to isUninvited excepts Mayors
      
      Meteor.users.find().forEach(function(user) {
        var isInvited = !!(user.isMayor || Invitations.findOne({ receivingUser: user._id }));
        if (!isInvited)
          Meteor.users.update(user._id, {$set: {isUninvited: true, isAccessDenied: true, isHidden: true}});
      });
      log('1/1');

      // done
      callback();
    }
  },

  { // 21 jun 2014
    name: "Multicity with Ambassadors",
    task: function(callback) {

      Meteor.users.update({}, {$set: {city: "lyon"}}, {multi: true});
      Meteor.users.update({isMayor: true}, {$unset: {isMayor: true}, $set: {ambassador: {city: "lyon"}}}, {multi: true});

      // Set highlights content

      Highlights.insert({
        "createdAt": new Date(),
        "city": "lyon",
        "imageUrl": "http://www.vach.fr/wp-content/uploads/2014/02/AOC-1038x576.png",
        "title": "l’Atelier des Objets Connectés #2",
        "subtitle": "14-15 Juin @ Pôle Pixel",
        "website": "http://www.atelier-objets-connectes.org/",
        "userId": Url.userIdFromUrl("http://lyon.hckrs.io/-")
      });

      Highlights.insert({
        "createdAt": new Date(),
        "city": "lyon",
        "imageUrl": "/img/highlights/blendWebMix.jpg",
        "title": "Blend Web Mix",
        "subtitle": "29-30 Octobre Cité internationale",
        "website": "http://www.blendwebmix.com/",
        "userId": Url.userIdFromUrl("http://lyon.hckrs.io/----_")
      });

      Highlights.insert({
        "createdAt": new Date(),
        "city": "lyon",
        "imageUrl": "/img/highlights/app-dernier-metro.jpg",
        "title": "Dernier métro",
        "subtitle": "web app Lyonnaise",
        "website": "http://yannlombard.github.io/derniermetro/",
        "userId": Url.userIdFromUrl("http://lyon.hckrs.io/--")
      });

      // Set gifts

      Gifts.insert({
        "createdAt": new Date(),
        "city": "lyon",
        "title": "co-working — 1 day",
        "websiteUrl": "http://www.la-cordee.net",
        "websiteName": "@ La cordée",
        "description": "Valid in the office space of your choice."
      });


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