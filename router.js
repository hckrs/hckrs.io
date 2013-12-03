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
      this.redirect('frontpage');
    }
  }

  // make sure that user is allowed to enter the site
  var allowedAccess = function() {
    if(Meteor.user() && !Meteor.user().allowAccess) {
      this.render('accessDenied');
      this.stop();
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
  Router.before(allowedAccess, {except: ['frontpage', 'invite']})

  // make sure there is a settings file specified
  Router.before(settingsRequired);

  // global router configuration
  Router.configure({
    autoRender: false
  });
}

