var self = this;


// Reset the database. All documents from all collections will be removed.
// At the end an initial set of dummy documents will be inserted.
// Dummy documents can be specified in the /private/DummyDB/ folder.
ResetDB = function() {

  // Don't allow to reset the production database
  if (Settings['environment'] === 'production')
    return;

  // remove all documents
  console.info("Reset database...")
  _.each(collections(), clearCollection);
  
  // insert dummy documents
  console.info("Init dummy database...")
  _.each(collections(), fillCollection);

  console.info("Done.")
}

// Initial reset database on first run of meteor
Meteor.startup(function() {
  Meteor.setTimeout(function(){
    if (Settings['environment'] === 'dev' && Users.find().count() === 0)
      ResetDB();
  }, 2000);
});
  


// PRIVATE

// Remove all documents from the specified meteor collection
var clearCollection = function(collection) {
  self[collection].remove({});
}

// Fill the given meteor collection with dummy documents
var fillCollection = function(collection) {

  // insert a single document into the collection
  var insertDoc = function(doc) {
    self[collection].insert(doc);
  }

  // get documents from dummy file located at /private/dummyDB/{Collection}.js
  try {
    var docs = Assets.getText("DummyDB/" + collection + ".js")

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