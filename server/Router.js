var URL = Npm.require('url');



// SERVER SIDE routes

Router.map(function () {

  this.route('mandrillWebhook', {
    where: 'server',
    path: '/mandrill-webhook',
    action: function() {
      var data = this.request.body;
      var events = EJSON.parse(data.mandrill_events);

      var addEvent = function(event) {
        // see for event format
        // http://help.mandrill.com/entries/24466132-Webhook-Format 
        
        if (!event.event) 
          return; /* not a message event */

        console.log('Email webhook event:', event.event);

        var messageId = event._id;
        var userAgent = event.user_agent_parsed && {
          mobile: event.user_agent_parsed.mobile,
          os: event.user_agent_parsed.os_family,
          client: event.user_agent_parsed.ua_family,
          version: event.user_agent_parsed.ua_version,
        };
        
        // link event to original message
        EmailsOutbound.update({'to.messageId': messageId}, {
          $push: { 'to.$.events': {
            event: event.event,
            url: event.url ? event.url : undefined,
            agent: userAgent ? userAgent : undefined,
          }}
        });

        // when it is a github growth mail, also register in growth collection
        switch(event.event) {
          case 'open': GrowthGithub.update({messageId: messageId}, {$set: {open: true}}); break;
          case 'click': GrowthGithub.update({messageId: messageId}, {$inc: {clicks: 1}}); break;
        }
      }

      // store events
      _.each(events, addEvent);

      // end incoming request
      this.response.end();
    }
  })

  this.route('any', {
    where: 'server',
    path: '/*',
    action: function () {
      var url = getRequestUrl(this.request); 
      var city = Url.city(url);
      var isLocalhost = Url.isLocalhost(url);

      // check if there is a valid city present in the url
      if (!city || !CITYMAP[city]) {

        // this subdomain doesn't exist or isn't a valid city
        
        // we try to find the closest city
        var userIp = getClientIp(this.request);
        var location = requestLocationForIp(userIp);
        var closestCity = findClosestCity(location);    
        
        if (closestCity) {

          // if closest city is found we redirect the user to a new url
          var cityUrl = Url.replaceCity(closestCity, url);
          return redirect(cityUrl, this.response);
          
        } else if (city !== 'www') {
  
          // If closest city can't be found, we redirect to www.
          // only if we are not already there.
          var cityUrl = Url.replaceCity('www', url);
          return redirect(cityUrl, this.response);
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




