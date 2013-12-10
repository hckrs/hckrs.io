
log = function() {
  console.log.apply(console, arguments);
}

capitaliseFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// check if all values from the first array
// are present in the second array (weak comparison)
allIn = function(values, allowedValues) {
  return _.all(values, function(v) { return _.contains(allowedValues, v); });
}

omitNull = function(obj) {
  obj = _.clone(obj);
  _.each(obj, function(val, key) {
    if (_.isNull(val) || _.isUndefined(val)) delete obj[key];
  }); return obj;
}

// find a value in an object by giving a path
// pathValue(user, "profile.name") --> user['profile']['name']
pathValue = function(obj, path) {
  var paths = path.split('.')
  var current = obj;
  _.each(paths, function(path) {
    if (current[path] == undefined) return undefined;
    current = current[path];
  }); return current;
}


// execute a performance intensive function after a short delay
// this delay is used to update UI elements.
// Notice that this function runs asynchronously.
exec = function(func) {
  Meteor.setTimeout(func, 50);
}


// calculate bithash of a number
// transform into a string where 0 and 1 are replaced by the given characters
bitHash = function(num) {
  return parseInt(num).toString(2).replace(/0/g, '_').replace(/1/g, '-');
}

// invert the bithash opration
bitHashInv = function(hash) {
  return parseInt(hash.replace(/_/g, '0').replace(/-/g, '1'), 2);
}

// hostname as specified in the environment variable ROOT_URL
appHostname = function() {
  return new RegExp(/\/\/([^\/:]*)/).exec(Meteor.absoluteUrl())[1];
}

// replace url's hostname
replaceHostname = function(url, newHostname) {
  return url.replace(/\/\/([^\/:]*)/, '//' + newHostname);
}

// geocoder for openstreet
geocode = function(address, cb) {
  var url = "http://nominatim.openstreetmap.org/search";
  var options = {params: { format: 'json', q: address }};
  var response = function(res) {
    var loc = res && res.data && res.data[0];
    if (loc && loc.lat && loc.lon)
      return { lat: loc.lat, lng: loc.lon };
  }
  if (Meteor.isServer)
    return response(HTTP.get(url, options));
  else
    HTTP.get(url, options, function(err, res) { cb(response(res)); });
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
          if ($elm instanceof $)
            $elm.removeClass(className); //direct feedback for better usability
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

  // check if the two values are equal (weak comparison)
  Handlebars.registerHelper('equals', function(val1, val2) {
    return val1 == val2;
  });

  // check if the given value is in the array
  Handlebars.registerHelper('contains', function(array, value) {
    return _.contains(array, value);
  });

  // return the current environment (local|production)
  Handlebars.registerHelper('environment', function() {
    return (Meteor.settings && Meteor.settings.public.environment) ||
           (/localhost/.test(Meteor.absoluteUrl()) ? 'local' : 'production');
  });  

  // template helper to use the value of a Session variable directly in the template
  Handlebars.registerHelper('Session', function(key) {
    return Session.get('key');
  });

  // template helper for testing if a Session variable equals a specified value
  Handlebars.registerHelper('SessionEquals', function(key, val) {
    return Session.equals('key', val);
  });

}



/* MATCH helpers */

// match if value equals the given value
Match.Equals = function(validValue) {
  return Match.Where(function(value) {
    return _.equals(value, validValue);
  });
}

// pass in an array of allowed elements
// when matching a string it must be present in the allowed array
Match.In = function(allowedValues) {
  return Match.Where(function(value) {
    return _.contains(allowedValues, value);
  });
}

// pass in an array of allowed elements
// when matching an array, all elements must be in the allowed array
Match.AllIn = function(allowedValues) {
  return [ Match.In(allowedValues) ];
}

// match e-mailaddress
Match.Email = Match.Where(function(email) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
});

// match empty or the given pattern
Match.EmptyOr = function(pattern) {
  return Match.OneOf(Match.Empty, pattern);
}

// match empty value (string, array, object, null, undefined, ...?)
Match.Empty = Match.Where(function(value) {
  return _.isEmpty(value);
});

// maximum character length
Match.Max = function(max, pattern) {
  return Match.Where(function(value) {
    var valid = value.length <= max;
    return pattern ? valid && Match.test(value, pattern) : valid;
  });
}

// minimum character length
Match.Min = function(min, pattern) {
  return Match.Where(function(value) {
    var valid = value.length >= min;
    return pattern ? valid && Match.test(value, pattern) : valid;
  });
}

// minimum and maximum
Match.MinMax = function(min, max, pattern) {
  return Match.Min(min, Match.Max(max, pattern));
}  


