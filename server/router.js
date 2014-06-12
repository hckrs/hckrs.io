var URL = Npm.require('url');



// SERVER SIDE routes

Router.map(function () {
  this.route('any', {
    where: 'server',
    path: '/*',
    action: function () {
      var url = getRequestUrl(this.request); 
      var city = Url.city(url);
      var isLocalhost = Url.isLocalhost(url);
      
      // check if there is a valid city present in the url
      if (!city || city === "www" || !CITYMAP[city]) {
        
        // if not, then find the closest city
        var userIp = getClientIp(this.request);
        var location = requestLocationForIp(userIp);
        var closestCity = (findClosestCity(location) || {}).key;    
        
        if (closestCity) {

          // if closest city is found we redirect the user to a new url
          // we handle 'localhost' (for development) seperately.
          // case 'localhost': add city in querystring
          // case 'production': replace city in subdomain
          var addToUrl = isLocalhost ? Url.addCityToParams : Url.replaceCity;
          var cityUrl = addToUrl(closestCity, url);
          return redirect(cityUrl, this.response);
          
        } else {
          // XXX TODO 
          // What to do if no closest city isn't found?
        }
      }
      
      // done!
      this.next();
    }
  });
});




// parse current request url
var getRequestUrl = function(request) {
  // XXX: not all properties can be resolved through '_parsedUrl'
  // Therefor we try to add some properties ourself.
  var parsed = {};
  parsed.protocol = request.headers['x-forwarded-proto'] || "http";
  parsed.host     = request.headers['host'];
  parsed.hostname = request.headers.host.split(':')[0];
  parsed.port     = request.headers.host.split(':')[1] || null;
  parsed.pathname = request._parsedUrl.pathname;
  parsed.path     = request._parsedUrl.path;
  parsed.query    = request._parsedUrl.query;
  parsed.search   = request._parsedUrl.search;
  parsed.hash     = request._parsedUrl.hash;
  return URL.format(parsed);
}

// redirect to new url
var redirect = function(url, res) {
  res.writeHead(302, {'Location': url});
  res.end();
}

// get client IP from request data
var getClientIp = function(request) {
  var ip1 = (request.headers['x-forwarded-for'] || "").split(',')[0]; // find ip even after proxy
  var ip2 = request.connection.remoteAddress; // default method
  return ip1 || ip2;
}

// request the location for some IP address
// using the service of Telize.com
var requestLocationForIp = function(ip) {
  if (ip === "127.0.0.1") 
    ip = ""; // if on localhost, let telize determine my ip.
  try {
    var data = HTTP.get("http://www.telize.com/geoip/" + ip, {timeout: 2000}).data;
    return _.pick(data, 'longitude', 'latitude');
  } catch(err) {
    console.log("request client-IP error:", err);
  }
}


