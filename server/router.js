// SERVER SIDE routes

var url = Npm.require('url');

// make use of the correct domain (canonical)
// redirect when not at the same hostname as specified in environment variable "ROOT_URL"
var useCanonicalDomain = function(currentUrlData, appUrlData) {
  if (currentUrlData.host.indexOf(appUrlData.host) === -1)
    return url.format(_.defaults({host: appUrlData.host}, currentUrlData));
  return null;
}

// redirect to city if not present in subdomain
var redirectToCity = function(currentUrlData, appUrlData) {

  // all cities on this app
  var allowedCities = ['lyon']; 

  // city where to redirect to
  var defaultCity = 'lyon';

  // current subdomain
  var subdomain = currentUrlData.host.replace(appUrlData.host, '').replace(/\.$/, '');

  // redirect if no valid city is specified in the subdomain
  if (!_.contains(allowedCities, subdomain))
    return url.format(_.defaults({host: defaultCity+'.'+appUrlData.host}, currentUrlData));   

  return null;
}

var redirect = function(url, res) {
  res.writeHead(302, {'Location': url});
  res.end();
}

// parse url specified in environment ROOT_URL
var getAppUrlData = function() {
  return url.parse(Meteor.absoluteUrl());
}

// parse current request url
// XXX: not all properties can be resolved
var getUrlData = function(request) {
  var currentUrlData = request._parsedUrl;
  currentUrlData.protocol = getAppUrlData().protocol;
  currentUrlData.host = request.headers.host;
  currentUrlData.hostname = request.headers.host.split(':')[0];
  currentUrlData.port = request.headers.host.split(':')[1] || null;
  currentUrlData.href = undefined;
  return currentUrlData
}


Router.map(function () {
  this.route('any', {
    where: 'server',
    path: '/*',
    action: function () {
      var currentUrlData = getUrlData(this.request);
      var appUrlData = getAppUrlData();
      var redirectUrl;
      
      // only run this code on a online server
      if (currentUrlData.hostname !== 'localhost') {

        // make use of the correct domain (canonical)
        if (redirectUrl = useCanonicalDomain(currentUrlData, appUrlData))
          return redirect(redirectUrl, this.response);

        // redirect to the default city if not present in subdomain
        if (redirectUrl = redirectToCity(currentUrlData, appUrlData))
          return redirect(redirectUrl, this.response);            
      }

      // otherwise default meteor behaviour
      this.next();
    }
  });
});