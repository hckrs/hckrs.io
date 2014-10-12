
DefaultController = RouteController.extend({
  layoutTemplate: "main",
  onRun: function() {

  },
  onBeforeAction: function() {
    
    // wait on global subscriptions ready
    this.wait({ready: Subscriptions.ready}); 
    
  },
  onAfterAction: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');

  },
  onStop: function() {


  }
});

DefaultAdminController = DefaultController.extend({
  layoutTemplate: "admin_layout",
  onBeforeAction: function() {

    if (!this.ready())
      return; // wait for subscriptions

    // check permissions to view admin panel
    if (!hasAmbassadorPermission())
      Router.go('frontpage');
  }
});