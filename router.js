if (Meteor.isClient) {

  
  // ROUTES 

  Router.map(function () {
    
    this.route('frontpage', { path: '/', template: 'frontpage' });
    
    this.route('hackers', { path: '/hackers', template: 'hackers' });
    
    this.route('places', { path: '/places', template: 'places' });
    
    this.route('invite', { path: '/invite/:code', template: 'frontpage', before: function() {
      Session.set('invitationCode', this.params.code);
      this.redirect('frontpage');
    }});
    
    this.route('hacker', { path: '/:localRankHash', template: 'hacker', before: function() { 
      var city = 'lyon';
      var localRankHash = this.params.localRankHash;
      var localRank = bitHashInv(localRankHash);
      var hacker = Meteor.users.findOne({city: city, localRank: localRank});

      if (!hacker)
        this.redirect('frontpage');
      
      Session.set('hackerId', hacker._id);
      Session.set('hacker', hacker);
    }});


  });



  /* custom functionality */

  // when login is required, render the frontpage
  var loginRequired = function() {
    if(!isLoggedIn()) {
      if (Meteor.userId()) 
        this.stop(); // login in progress, wait!
      else {
        this.stop();
        this.render('frontpage'); //hold current route, but render frontpage
      }
    }
  }

  // make sure that user is allowed to enter the site
  var allowedAccess = function() {
    if(Meteor.user() && !Meteor.user().allowAccess) {
      this.redirect('hacker', Meteor.user());
    }
  }

  // verify if meteor is started up with a settings file
  var settingsRequired = function() {
    if (!Meteor.settings) {
      this.render('requireSettingFile');
      this.stop();
    }
  }


  // make sure the user is logged in, except for the pages below
  Router.before(loginRequired, {except: ['frontpage', 'invite']});

  // make sure that user is allowed to enter the site
  Router.before(allowedAccess, {except: ['invite', 'hacker']})

  // make sure there is a settings file specified
  Router.before(settingsRequired);

  // global router configuration
  Router.configure({
    autoRender: false
  });





  // make use of the correct domain (canonical)
  // redirect when not at the same hostname as specified in environment variable "ROOT_URL"
  var useCanonicalDomain = function() {
    if (location.hostname.indexOf(appHostname()) === -1)
      document.location.href = replaceHostname(location.href, appHostname());
  }

  // redirect to city if not present in subdomain
  var redirectToCity = function() {

    // all cities on this app
    var allowedCities = ['lyon']; 

    // city where to redirect to
    var defaultCity = 'lyon';

    // current subdomain
    var subdomain = location.hostname.replace(appHostname(), '').split('.')[0];

    // redirect if no valid city is specified in the subdomain
    if (!_.contains(allowedCities, subdomain))
      document.location.href = replaceHostname(location.href, defaultCity+'.'+appHostname());    
  }


  // resolve correct url when entering the site
  Meteor.startup(function() {

    // only run this code on a online server
    if (Meteor.settings.public.environment != "local") {

      // make use of the correct domain (canonical)
      useCanonicalDomain();

      // redirect to the default city if not present in subdomain
      redirectToCity();
    
    }
      
  });

}

