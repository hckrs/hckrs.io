
log = function() {
  console.log.apply(console, arguments);
}

capitaliseFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

omitNull = function(obj) {
  obj = _.clone(obj);
  _.each(obj, function(val, key) {
    if (_.isNull(val)) delete obj[key];
  }); return obj;
}


if (Meteor.isClient) {

  // check if user is logged in
  isLoggedIn = function() {
    return Session.equals('currentLoginState', 'loggedIn');
  }

  // adding a class to a html element for a specified duration (in ms)
  addDynamicClass = function(id, className, duration) {
    duration = duration || 1000;
    
    var setupTimer = function(err, docId) {
      if(duration !== -1) {
        Meteor.setTimeout(function() {
          DynamicClasses.remove(docId);
        }, duration);  
      }
    }

    DynamicClasses.insert({ elementId: id, className: className }, setupTimer);
  }

  // dynamic class helper that returns additional classes that 
  // are setted on the html element specified by its id
  Handlebars.registerHelper('dynamicClass', function(elementId) {
    return _.pluck(DynamicClasses.find({ elementId: elementId }).fetch(), 'className').join(' ');
  });

  Handlebars.registerHelper('loggedIn', function() {
    return isLoggedIn();
  });

  // _currentUser helper that only contains the user id
  // this helper is less reactive than the default currentUser helper,
  // because it doesn't rerun each time the user information is changing
  Handlebars.registerHelper('_currentUser', function() {
    var id = Meteor.userId();
    return id ? { _id: id } : null;
  });

  Handlebars.registerHelper('equals', function(val1, val2) {
    return val1 == val2;
  });

}