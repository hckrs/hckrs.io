
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


// execute a performance intensive function after a short delay
// this delay is used to update UI elements.
// Notice that this function runs asynchronously.
exec = function(func) {
  Meteor.setTimeout(func, 50);
}


if (Meteor.isClient) {

  // check if user is logged in
  isLoggedIn = function() {
    return Session.equals('currentLoginState', 'loggedIn');
  }

  // adding a class to a html element for a specified duration (in ms)
  addDynamicClass = function($elm, className, duration) {
    var id = $elm; 
    
    if ($elm instanceof $) {
      id = $elm.attr('id');
      $elm.addClass(className); //direct feedback for better usability
    }

    var setupTimer = function(err, docId) {
      if(duration) {
        Meteor.setTimeout(function() {
          DynamicClasses.remove(docId);
        }, duration);  
      }
    }

    exec(function() {
      DynamicClasses.insert({ elementId: id, className: className }, setupTimer);
    });
  }

  // remove a dynamic class
  removeDynamicClass = function($elm, className) {
    var id = $elm; 
    
    if ($elm instanceof $) {
      id = $elm.attr('id');
      $elm.removeClass(className); //direct feedback for better usability
    }

    exec(function() {
      DynamicClasses.find({ elementId: id }).forEach(function(doc) {
        DynamicClasses.remove(doc._id);  
      });
    });
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