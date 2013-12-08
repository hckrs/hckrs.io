if (Meteor.isClient) {

  
  // ROUTES 

  Router.map(function () {
    
    this.route('frontpage', { path: '/', template: 'frontpage' });
    
    this.route('hackers', { path: '/hackers', template: 'hackers' });
    
    this.route('places', { path: '/places', template: 'places',
      load: function() { 
        Session.set('absoluteHeader', true); 
        Session.set('inversedHeader', true); 
      },
      unload: function() {
        Session.set('absoluteHeader', false); 
        Session.set('inversedHeader', false); 
      }
    });
    
    this.route('invite', { path: '/invite/:code', template: 'frontpage', 
      before: function() {
        Session.set('invitationCode', this.params.code);
        this.redirect('frontpage');
      }
    });
    
    this.route('hacker', { path: '/:localRankHash', template: 'hacker', 
      before: function() { 
        var city = 'lyon';
        var localRankHash = this.params.localRankHash;
        var localRank = bitHashInv(localRankHash);
        var hacker = Meteor.users.findOne({city: city, localRank: localRank});

        if (!hacker)
          this.redirect('frontpage');
        
        Session.set('hackerId', hacker._id);
        Session.set('hacker', hacker);
      }
    });

  });



  /* custom functionality */

  // XXX in iron-router you can't call this.redirect() if you want
  // that the unload event must be triggered. Instead you must use
  // Router.go() and then stopping the current route with this.stop()


  // check if there are duplicate accounts, if so request for merge
  var checkDuplicateAccounts = function() {
    if (Session.get('requestMergeDuplicateAccount')) {
      this.render('requestMergeDuplicateAccount');
      this.stop();
    }
  }

  // when login is required, render the frontpage
  var loginRequired = function() {
    
    if (!isLoggedIn() && Meteor.userId())
      return this.stop(); // login in progress, wait!
    
    if (!isLoggedIn()) {
      
      // hold current route so we can redirect after login
      var url = location.pathname + location.search + location.hash;
      Session.set('redirectUrl', url);

      // redirect to frontpage so that the user can login
      Router.go('frontpage'); 
      this.stop();
    }

  }

  // make sure that user is allowed to enter the site
  var allowedAccess = function() {
    if(Meteor.user() && !Meteor.user().allowAccess) {
      Router.go('hacker', Meteor.user()); 
      this.stop();
    }
  }



  // check for duplicate accounts, if so request for merge
  Router.before(checkDuplicateAccounts, {except: ['frontpage', 'invite']});

  // make sure the user is logged in, except for the pages below
  Router.before(loginRequired, {except: ['frontpage', 'invite']});

  // make sure that user is allowed to enter the site
  Router.before(allowedAccess, {except: ['invite', 'hacker']})

  // global router configuration
  Router.configure({
    autoRender: false
  });


}





if (Meteor.isServer) {

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
    var subdomain = currentUrlData.host.replace(appUrlData.host, '').split('.')[0];

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
        if (Meteor.settings.public.environment !== 'local') {

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
}