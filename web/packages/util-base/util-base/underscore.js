

// check if all values from the first array
// are present in the second array (weak comparison)
Util.allIn = function(values, allowedValues) {
  return _.all(values, function(v) { return _.contains(allowedValues, v); });
}

// check if some of the values are present in all values
Util.someIn = function(values, allValues) {
  return _.some(values, function(v) { return _.contains(allValues, v); });
}

// make sure we have an array
// transform if it is not already
Util.array = function(val) {
  if (_.isArray(val)) return val;
  return _.compact([val]);
}



// return an array with uniq value
// compared by the _.isEqual function
Util.uniqFilter = function(arr) {
  return _.reject(arr, function(val, i) { return _.some(_.first(arr, i), _.partial(_.isEqual, val)); });
}

Util.omitNull = function(obj) {
  obj = _.clone(obj);
  _.each(obj, function(val, key) {
    if (_.isNull(val) || _.isUndefined(val)) delete obj[key];
  }); return obj;
}

Util.omitEmpty = function(o) {
  o = Util.omitNull(o);
  _.each(o, function(v, k){ if(_.isString(v) && !v) delete o[k]; });
  return o;
}

// find a value in an object by giving a path
// Util.property(user, "profile.name") --> user['profile']['name']
Util.property = function(obj, path) {
  var paths = path.split('.')
  var current = obj;
  _.each(paths, function(path) {
    if (!_.isObject(current)) 
      return current = undefined;
    current = current[path];
  }); 
  return current;
}