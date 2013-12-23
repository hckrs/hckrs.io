if (Meteor.isClient) {

  
  // ROUTES 

  Router.map(function () {
    
    this.route('frontpage', { path: '/', template: 'frontpage' });
    
    this.route('hackers', { path: '/hackers', template: 'hackers' });

    this.route('invitations', { path: '/invitations', template: 'invitations' });

    this.route('agenda', { path: '/agenda', template: 'agenda' });
    
    this.route('about', { path: '/about', template: 'about' });

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

    this.route('verifyEmail', {path: '/verify-email/:token',
      load: function() {
        var token = this.params.token;
        
        // log to google analytics
        Meteor.call('getEmailVerificationTokenUser', token, function(err, user) {
          if (!err && user) 
            GAnalytics.event('EmailVerification', 'verified user', user._id);
          else GAnalytics.event('EmailVerification', 'invalid token', token);
        });
      },
      action: function() {
        Accounts.verifyEmail(this.params.token, checkAccess);
        Router.go('hackers');
        this.stop();
      }
    });
    
    this.route('hacker', { path: '/:localRankHash', template: 'hacker', 
      load: function() {
        var city = 'lyon';
        var localRankHash = this.params.localRankHash;
        var localRank = bitHashInv(localRankHash);
        var hacker = Meteor.users.findOne({city: city, localRank: localRank}, {reactive: false});
        
        // log to google analytics
        if (hacker)
          GAnalytics.event('Views', 'profile', hacker._id);
        else GAnalytics.event('Views', 'profile unknow', city+' '+localRank);
      },
      before: function() { 
        var city = 'lyon';
        var localRankHash = this.params.localRankHash;
        var localRank = bitHashInv(localRankHash);
        var hacker = Meteor.users.findOne({city: city, localRank: localRank});
        
        if (!hacker)
          return this.redirect('frontpage');
        
        Session.set('hackerId', hacker._id);
        Session.set('hacker', hacker);
        Session.set('hackerEditMode', true);
      },
      unload: function() {
        Session.set('hackerId', null);
        Session.set('hacker', null);
      }
    });


    this.route('invite', { path: /^\/\+\/(.*)/, template: 'frontpage',
      before: function() {
        var phrase = bitHashInv(this.params[0]);
        
        Session.set('invitationPhrase', phrase);

        // get associated broadcast user
        Meteor.call('getBroadcastUser', phrase, function(err, broadcastUser) {
          Session.set('invitationBroadcastUser', broadcastUser);
        });

        this.redirect('frontpage');
      }
    });
  

  });




  /* resolve url helpers */

  Router.routes['invite'].url = function(params) {
    return Meteor.absoluteUrl('+/' + params.phrase);
  }



  /* custom functionality */

  // XXX in iron-router you can't call this.redirect() if you want
  // that the unload event must be triggered. Instead you must use
  // Router.go() and then stopping the current route with this.stop()
  //
  // It is not recommend to set session variables in the before/load functions
  // this will trigger a recomputation of the route


  // wait to the subscriptions are fully loaded before rendering a template
  var waitOnSubscriptionsReady = function() {
    if (!Session.get('subscriptionsReady'))
      this.stop();  
  }

  // when login is required, render the frontpage
  var loginRequired = function() {

    switch (Session.get('currentLoginState')) {
      
      case 'loggedOut':
        // redirect to frontpage so that the user can login
        Session.set('redirectUrl', location.pathname + location.search + location.hash);
        Router.go('frontpage'); 
        this.stop();  
        break;

      case 'loggingIn':
        // make sure that the user subscriptions are ready first
        this.stop();
        break;
    }

  }

  // check if there are duplicate accounts, if so request for merge
  var checkDuplicateAccounts = function() {
    if (Session.get('requestMergeDuplicateAccount')) {
      this.render('requestMergeDuplicateAccount');
      this.stop();
    }
  }

  // make sure that user is allowed to enter the site
  var allowedAccess = function() {
    if(Meteor.user() && Meteor.user().isAccessDenied) {
      Router.go('hacker', Meteor.user()); 
      this.stop();
    }
  }


  // make sure the subscriptions are fully loaded
  var except = ['frontpage', 'invite', 'verifyEmail', 'about'];
  Router.load(waitOnSubscriptionsReady, {except: except});
  Router.before(waitOnSubscriptionsReady, {except: except});

  // make sure the user is logged in, except for the pages below
  var exceptLogin = ['frontpage', 'invite', 'verifyEmail', 'about'];
  Router.load(loginRequired, {except: exceptLogin});
  Router.before(loginRequired, {except: exceptLogin});

  // check for duplicate accounts, if so request for merge
  Router.before(checkDuplicateAccounts, {except: exceptLogin});

  // make sure that user is allowed to enter the site
  Router.before(allowedAccess, {except: ['hacker', 'invite', 'verifyEmail']})

  // log pageview to Google Analytics
  Router.load(GAnalytics.pageview);


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

}