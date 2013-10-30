if (Meteor.isClient) {

  
  // ROUTES 

  Router.map(function () {
    this.route('frontpage', { path: '/' });
    this.route('hackers', { path: '/hackers' });
    this.route('hacker', { path: 'hacker/:_id'});
  });




  /* custom functionality */


  // when login is required, render the frontpage
  var loginRequired = function() {
    if(!Meteor.user()) {
      this.render('frontpage');
      this.stop();
    }
  }

  // make sure the user is logged in, except for the pages below
  Router.before(loginRequired, {except: ['frontpage']});

  // global router configuration
  Router.configure({
    template: 'main', //all routes load the 'main' template
    data: function() { //parse for all routes the template name and parameters to the template
      return { route: _.extend({template: this.options.route.name}, this.params) };
    }
  });

  // template helper to check if the current route match the given template name
  Handlebars.registerHelper('route', function(templateName) {
    return this.route.template == templateName;
  });

}

