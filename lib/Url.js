// utilities to work on urls

Url = {}


/* First some SPECIFIC FUNCTIONS for hckrs.io */

// get the current city from the url
Url.city = function(url) {
  url = url || currentUrl();
  var root = Url.root();
  var param = Url.getParams(url).currentCity;
  var subdomain = Url.hostname(url).replace(new RegExp(".?" + root), '');
  return param || subdomain;
}

// replace city name in url
// e.g. http://www.staging.hckrs.io => http://lyon.staging.hckrs.io
Url.replaceCity = function(city, url) {
  url = url || currentUrl();
  var oldHostname = Url.hostname(url);
  var newHostname = city + '.' + Url.root();
  return url.replace(oldHostname, newHostname);
}

// e.g. http://www.staging.hckrs.io => http://www.staging.hckrs.io/?currentCity={city}
Url.addCityToParams = function(city, url) {
  url = url || currentUrl();
  return Url.addParams({"currentCity": city}, url);
}

// get user identifier object of the form:
// {city: String, localRank: Number}
Url.userIdentifierFromUrl = function(url) {
  url = url || currentUrl();
  var city = Url.city(url);
  var localRank = Url.bitHashInv(_.last(url.split('/')));
  return {city: city, localRank: localRank};
}

// get userId from given url
Url.userIdFromUrl = function(url) {
  var selector = Url.userIdentifierFromUrl(url);
  return (Users.findOne(selector, {fields: {_id: true}}) || {})._id;
}

// calculate bithash of a number
// transform into a string where 0 and 1 are replaced by the given characters
Url.bitHash = function(num) {
  return parseInt(num).toString(2).replace(/0/g, '_').replace(/1/g, '-');
}

// invert the bithash opration
Url.bitHashInv = function(hash) {
  return parseInt(hash.replace(/_/g, '0').replace(/-/g, '1'), 2);
}






/* GENERAL functions */

Url.root = function() {
  var url = Meteor.absoluteUrl(); // ROOT_URL
  return Url.hostname(url);
}

// e.g. http://lyon.staging.hckrs.io/home => lyon.staging.hckrs.io
Url.hostname = function(url) {
  url = url || currentUrl();
  return parseUrl(url).hostname;
}

// e.g. http://lyon.staging.hckrs.io/test => hckrs.io
// XXX not ready to support all domain extensions 
Url.domain = function(url) {
  url = url || currentUrl();
  var hostname = Url.hostname(url);
  return new RegExp(/([^.]*.[a-zA-Z]{2,4}(.uk)?)$/).exec(hostname)[1];
}

// remove protocal (http:// or https://) of an url
// e.g. http://www.google.com => www.google.com
Url.show = function(url) {
  url = url || currentUrl();
  return url.replace(/^(http(s)?:\/\/(www.)?)/i, "");
}

// make sure that extern urls includes http:// or https://
Url.externUrl = function(url) {
  if (!/^(http(s?):\/\/)/i.test(url))
    url = "http://" + url;
  return url;
}

// check if we are on localhost
Url.isLocalhost = function(url) {
  url = url || currentUrl();
  return Url.hostname(url) === 'localhost';
}

// add key/value pairs to the url
// it will be appended if it has already a querystring
Url.addParams = function(properties, url) {
  url = url || currentUrl();
  var params = Url.getParams(url);
  var newParams = _.extend(params, properties)
  var searchString = Url.createSearchString(newParams);
  return Url.replace(url, function(o) {
    o.search = searchString;
    return o;
  });  
}

// create a search string from a map of params
Url.createSearchString = function(params) {
  var queryString = _.map(params, function(v,k) { return k+"="+v; }).join('&');
  return _.size(params) ? '?' + queryString : "";
}

// get query string object
Url.getParams = function(url) {
  url = url || currentUrl();
  var qs = (url.split('?',2)[1] || "").split("#")[0];
  return _.object(_.map(_.compact(qs.split('&')), function(kv, k) { return kv.split('=',2); }));
}

// remove query string entry
Url.removeParam = function(key, url) {
  url = url || currentUrl();
  var params = Url.getParams(url);
  var newParams = _.omit(params, key);
  var searchString = Url.createSearchString(newParams);
  return Url.replace(url, function(o) {
    o.search = searchString;
    return o;
  });
}

// can be used to replace some components from the url
// the delegate function receives an parsed url object
// you can ONLY edit the following properties: 
// protocol, host, pathname, search, hash
Url.replace = function(url, func) {
  return formatUrl(func(parseUrl(url)));
}



var parseUrl;
var formatUrl;
var currentUrl;

if (Meteor.isClient) {

  currentUrl = function() {
    return window.location.href;
  }

  parseUrl = function(url) {
    var parser = document.createElement('a');
    parser.href = url;
    parser.protocol; // => "http:"
    parser.hostname; // => "example.com"
    parser.port;     // => "3000"
    parser.pathname; // => "/pathname/"
    parser.search;   // => "?search=test"
    parser.hash;     // => "#hash"
    parser.host;     // => "example.com:3000"  
    return parser;
  }

  formatUrl = function(o) {
    return o.protocol + "://" + o.host + o.pathname + o.search + o.hash;
  }

}

if (Meteor.isServer) {

  var URL = Npm.require('url');

  currentUrl = function() {
    return Meteor.absoluteUrl();
  }

  parseUrl = function(url) {
    return URL.parse(url);
  }

  formatUrl = function(url) {
    return URL.format(url);
  }

}