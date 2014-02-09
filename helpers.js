
String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
}

log = function() {
  console.log.apply(console, arguments);
}

capitaliseFirstLetter = function(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

decodeHtmlEntities = function(str) {
  return $('<div />').html(str).text();
}

// check if all values from the first array
// are present in the second array (weak comparison)
allIn = function(values, allowedValues) {
  return _.all(values, function(v) { return _.contains(allowedValues, v); });
}

// return an array with uniq value
// compared by the _.isEqual function
uniqFilter = function(arr) {
  return _.reject(arr, function(val, i) { return _.some(_.first(arr, i), _.partial(_.isEqual, val)); });
}

omitNull = function(obj) {
  obj = _.clone(obj);
  _.each(obj, function(val, key) {
    if (_.isNull(val) || _.isUndefined(val)) delete obj[key];
  }); return obj;
}

omitEmpty = function(o) {
  _.each(o, function(v, k){ if(!v) delete o[k]; });
  return o;
}

// find a value in an object by giving a path
// pathValue(user, "profile.name") --> user['profile']['name']
pathValue = function(obj, path) {
  var paths = path.split('.')
  var current = obj;
  _.each(paths, function(path) {
    if (!_.isObject(current)) 
      return current = undefined;
    current = current[path];
  }); 
  return current;
}

errorSuccess = function(errHandler, sucHandler) {
  return function(err, result) {
    if (err) errHandler(err, result)
    else sucHandler(err, result)
  };
}

// remove the error part of a callback
succeed = function(func) {
  return function() {
    func.apply(this, Array.prototype.slice.apply(arguments).slice(1));
  }
}

// execute a performance intensive function after a short delay
// this delay is used to update UI elements.
// Notice that this function runs asynchronously.
exec = function(func) {
  Meteor.setTimeout(func, 50);
}

// get new Date() object by using format YYYY-MM-DD hh::mm:ss
newDate = function(dateString) {
  if (!dateString)
    return moment().toDate();
  return moment(dateString, "YYYY-MM-DD hh:mm:ss").toDate();
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

// get the current city from the url
cityFromUrl = function(url) {
  var city = hostnameFromUrl(url).split('.')[0];
  return (city === 'localhost') ? 'lyon' : city; //use lyon instead of localhost
}

// get user object from given url
userFromUrl = function(url, options) {
  var city = cityFromUrl(url);
  var localRankHash = _.last(url.split('/'));
  var localRank = bitHashInv(localRankHash);
  return Meteor.users.findOne({city: city, localRank: localRank}, options || {});
}

// get userId from given url
userIdFromUrl = function(url, options) {
  var user = userFromUrl(url, options);
  return user && user._id;
}

// hostname as specified in the environment variable ROOT_URL
// e.g. staging.hckrs.io
appHostname = function() {
  return hostnameFromUrl(Meteor.absoluteUrl());
}

// extract hostname from the given url
// e.g. http://lyon.hckrs.io/home => lyon.hckrs.io
hostnameFromUrl = function(url) {
  return new RegExp(/\/\/([^\/:]*)/).exec(url)[1];
}

// extract the most basic name including extension
// e.g. http://lyon.hckrs.io/test => hckrs.io
domainFromUrl = function(url) {
  var hostname = hostnameFromUrl(url);
  return new RegExp(/([^.]*.[a-zA-Z]{2,4}(.uk)?)$/).exec(hostname)[1];
}

// replace url's hostname
// e.g. newHostname: lyon.hckrs.io, lyon.staging.hckrs.io
replaceHostname = function(url, newHostname) {
  return url.replace(/\/\/([^\/:]*)/, '//' + newHostname);
}

// make sure that extern urls includes http:// or https://
externUrl = function(url) {
  if (!/^(http(s?):\/\/)/i.test(url))
    url = "http://" + url;
  return url;
}

// remove protocal (http:// or https://) of an url
removeUrlProtocol = function(url) {
  return url.replace(/^(http(s)?:\/\/(www.)?)/i, "");
}

resolveURL = function(base_url, url) {
  var doc      = document
    , old_base = doc.getElementsByTagName('base')[0]
    , old_href = old_base && old_base.href
    , doc_head = doc.head || doc.getElementsByTagName('head')[0]
    , our_base = old_base || doc_head.appendChild(doc.createElement('base'))
    , resolver = doc.createElement('a')
    , resolved_url
    ;
  our_base.href = base_url;
  resolver.href = url;
  resolved_url  = resolver.href; // browser magic at work here
 
  if (old_base) old_base.href = old_href;
  else doc_head.removeChild(our_base);
 
  return resolved_url;
}

fixedDecimals = function(value, decimals) {
  return parseFloat(value).toFixed(decimals);
}

convertToCurrency = function(value) {
  if (typeof(value) !== 'number') return "";
  var val = fixedDecimals(value, 2);
  return "€ " + val.replace('.00', '.-').replace('.', ',');
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

  // load an image into the DOM
  // always return without error but the image can be undefined
  loadImage = function(url, cb) {
    $("<img />")
    .on('error', function() { cb(null, undefined); })
    .on('load', function() { cb(null, this); })
    .attr('src', url);  
  }

  Meteor.Collection.prototype.clear = function() {
    var remove = function(doc) { this.remove(doc._id); }.bind(this);
    this.find().forEach(remove);
  }

  // get clipboard dat from paste-event
  getClipboardData = function() {
    if (window.clipboardData && window.clipboardData.getData) // IE
      return window.clipboardData.getData('Text');
    if (event.clipboardData && event.clipboardData.getData)
      return event.clipboardData.getData('text/plain');
    throw "Can't access the clipboard.";
  }

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
    return Meteor.settings && Meteor.settings.public.environment;
  });  

  // template helper to use the value of a Session variable directly in the template
  Handlebars.registerHelper('Session', function(key) {
    return Session.get(key);
  });

  // template helper for testing if a Session variable equals a specified value
  Handlebars.registerHelper('SessionEquals', function(key, val) {
    return Session.equals(key, val);
  });

  // template helper for stripping the protocol of an url
  Handlebars.registerHelper('ShowUrl', function(url) {
    return removeUrlProtocol(url);
  });

  // template helper to transform Date() object to readable tring
  Handlebars.registerHelper('Calendar', function(date) {
    if (!date) return "";
    return moment(date).calendar();
  });

  // template helper to transform Date() object to readable tring
  Handlebars.registerHelper('Date', function(date, format) {
    if (!date) return "";
    return moment(date).format(format);
  });

  // template helper to convert number to valuta string 
  Handlebars.registerHelper('Currency', function(value) { 
    return convertToCurrency(value);
  });

  Handlebars.registerHelper('HTML', function(html) {
    return new Handlebars.SafeString(html);
  });

}


if (Meteor.isServer) {

  var Fiber = Npm.require('fibers');
  var Future = Npm.require('fibers/future');
  
  sync = function() {
    var future = new Future();
    var args = Array.prototype.slice.apply(arguments).slice(1);
    args.push(future.resolver());
    arguments[0].apply(this, args);
    return future.wait();
  }

  fiber = function(func) {
    return function() {
      var args = arguments;
      Fiber(function() {
        func.apply(this, args);
      }).run();
    };
  }
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

// match url
Match.URL = Match.Where(function(url) {
  return /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi.test(url);
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


