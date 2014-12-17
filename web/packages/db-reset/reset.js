var self = this;


// When detecting an empty database, add some dummy documents.
// Dummy documents can be specified in the /private/DummyDB/ folder.
Meteor.startup(function() {
  Meteor.setTimeout(function(){
    if (Settings['environment'] === 'dev' && Users.find().count() === 0)
      resetDB();
  }, 2000);
});



// Reset the database by fill in dummy documents.
// You must manually clear the database before calling this function.
var resetDB = function() {

  // Don't allow to reset the production database
  if (Settings['environment'] === 'production')
    return;

  // XXX removing documents from the database is handled by 
  // CLI command "meteor reset", which must be called
  // before calling this function.
  
  // insert dummy documents
  console.info("Init dummy database...")
  _.each(collections(), fillCollection);

  console.info("Done.")
}

// Fill the given meteor collection with dummy documents
var fillCollection = function(collection) {

  // insert a single document into the collection
  var insertDoc = function(doc) {
    self[collection].insert(doc);
  }

  // get documents from dummy file located at /private/dummyDB/{Collection}.js
  try {
    var docs = Assets.getText("dummy-db/" + collection + ".js")

    // evaluate documents and insert them into the database
    try {    
      docs = eval(docs); 
      console.log("Insert " + collection + "...");
      _.each(docs, insertDoc);
    } catch(err) {
      console.error(err);
    };
  } catch(e) {

  } 
}

// Get all collections from the global namespace
var collections = function() {

  // Specify an order (optional)
  // Required to handle dependencies like foreign ID's
  var order = [
    'Users'
  ];

  // force global to be a plain object
  var global = _.object(_.keys(self), _.values(self)); 

  // check if value is a mongo collection
  var isColl = function(c) { return c instanceof Mongo.Collection; }

  // extract collections
  var collections = _.chain(global)
    .map(function(v,k) { return isColl(v) ? k : null ; })
    .compact()
    .sortBy(function(c) { 
      var i = _.indexOf(order, c);
      return i < 0 ? 999 : i;  
    })
    .value()

  return collections;
}