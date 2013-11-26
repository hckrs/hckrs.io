if (Meteor.isClient) {

  
  // ROUTES 

  Router.map(function () {
    this.route('frontpage', { path: '/' });
    this.route('hackers', { path: '/hackers' });
    
    this.route('hacker', { 
      path: '/hacker/:_id', 
      before: function() { 
        var hackerId = this.params._id;
        Session.set('hackerId', hackerId);
        Deps.autorun(function() {
          Session.set('hacker', Meteor.users.findOne(hackerId));
        });
      }
    });

  });



  /* custom functionality */

  // when login is required, render the frontpage
  var loginRequired = function() {
    if(!isLoggedIn()) {
      this.render('frontpage');
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
  Router.before(loginRequired, {except: ['frontpage']});

  // make sure there is a settings file specified
  Router.before(settingsRequired);

  // global router configuration
  Router.configure({
    autoRender: false
  });
}

