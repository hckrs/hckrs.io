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