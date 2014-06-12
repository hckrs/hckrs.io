
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

fixedDecimals = function(value, decimals) {
  return parseFloat(value).toFixed(decimals);
}

convertToCurrency = function(value) {
  if (typeof(value) !== 'number') return "";
  var val = fixedDecimals(value, 2);
  return "€ " + val.replace('.00', '.-').replace('.', ',');
}






// GEO

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

getDistanceFromLatLonObj = function(latlong1, latlong2) {
  var lat1 = latlong1.latitude || latlong1.lat;
  var lon1 = latlong1.longitude || latlong1.lon;
  var lat2 = latlong2.latitude || latlong2.lat;
  var lon2 = latlong2.longitude || latlong2.lon;
  return getDistanceFromLatLon(lat1, lon1, lat2, lon2);
}

getDistanceFromLatLon = function(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d; // km
}

deg2rad = function(deg) {
  return deg * (Math.PI/180)
}

findClosestCity = function(latlon) {
  if (!latlon) return null;
  return _.min(CITIES, _.partial(getDistanceFromLatLonObj, latlon));
}



// CLIENT ONLY

if (Meteor.isClient) {

  // load an image into the DOM
  // always return without error but the image can be undefined
  loadImage = function(url, cb) {
    $("<img />")
    .on('error', function() { cb(null, undefined); })
    .on('load', function() { cb(null, this); })
    .attr('src', url);  
  }


  // auto grow input fields
  // resizing fields depending on their text size
  initializeAutoGrow = function() {
    $("input.text").each(function() {
      $(this).autoGrowInput({
        comfortZone: parseInt($(this).css('font-size')),
        minWidth: 150,
        maxWidth: 500
      });
    });
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

  // adding a class to a html element for a specified duration (in ms)  
  addTemporaryClass = function($elm, className, duration) {
    $elm.addClass(className);
    Meteor.setTimeout(function() {
      $elm.removeClass(className);
    }, duration || 1000);
  }


  

  // return the class name(s) if predicate holds
  UI.registerHelper('classIf', function(classes, predicate) {
    return predicate ? classes : "";
  });
  UI.registerHelper('classUnless', function(classes, predicate) {
    return !predicate ? classes : "";
  });

  // check if the two values are equal (weak comparison)
  UI.registerHelper('equals', function(val1, val2) {
    return val1 == val2;
  });

  // check if the given value is in the array
  UI.registerHelper('contains', function(array, value) {
    return _.contains(array, value);
  });

  // return the current environment (local|production)
  UI.registerHelper('environment', function() {
    return Meteor.settings && Meteor.settings.public.environment;
  });  

  // template helper to use the value of a Session variable directly in the template
  UI.registerHelper('Session', function(key) {
    return Session.get(key);
  });

  // template helper for testing if a Session variable equals a specified value
  UI.registerHelper('SessionEquals', function(key, val) {
    return Session.equals(key, val);
  });

  // template helper for stripping the protocol of an url
  UI.registerHelper('ShowUrl', function(url) {
    return Url.show(url);
  });

  // template helper to transform Date() object to readable tring
  UI.registerHelper('Calendar', function(date) {
    if (!date) return "";
    return moment(date).calendar();
  });

  // template helper to transform Date() object to readable tring
  UI.registerHelper('Date', function(date, format) {
    if (!date) return "";
    return moment(date).format(format);
  });

  // template helper to convert number to valuta string 
  UI.registerHelper('Currency', function(value) { 
    return convertToCurrency(value);
  });

  UI.registerHelper('HTML', function(html) {
    return new Spacebar.SafeString(html);
  });

  UI.registerHelper('Domain', function(url) {
    url = _.isString(url) ? url : null;
    return Url.domain(url);
  });

  UI.registerHelper('Hostname', function(url) {
    url = _.isString(url) ? url : null;
    return Url.hostname(url);
  });

  UI.registerHelper('CurrentCity', function() {
    return Session.get('currentCity');
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


