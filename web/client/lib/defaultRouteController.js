
DefaultController = RouteController.extend({
  layoutTemplate: "main",
  loadingTemplate: "loading",
  onBeforeAction: function() {

    /* Default Spin design */
    Spin.default = { color: '#fff' }
    
    // wait on global subscriptions ready
    if (!Subscriptions.ready() || Meteor.loggingIn()) {
      this.render('loading');
      return;
    }

    this.next(); 
  },
  onAfterAction: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');
  }
});

DefaultAdminController = DefaultController.extend({
  layoutTemplate: "admin_layout",
  loadingTemplate: "loading",
  onBeforeAction: function() {

    /* Default Spin design */
    Spin.default = { color: '#ccc' }
    
    // check permissions to view admin panel
    if (!Users.hasAmbassadorPermission())
      this.redirect('frontpage');

    this.next();
  }
});
