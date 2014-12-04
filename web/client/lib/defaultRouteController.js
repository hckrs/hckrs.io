
DefaultController = RouteController.extend({
  layoutTemplate: "main",
  onBeforeAction: function() {
    
    // wait on global subscriptions ready
    if (Subscriptions.ready())
      this.next();
  },
  onAfterAction: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');
  }
});

DefaultAdminController = DefaultController.extend({
  layoutTemplate: "admin_layout",
  onBeforeAction: function() {
    
    // check permissions to view admin panel
    if (!hasAmbassadorPermission())
      this.redirect('frontpage');

    this.next();
  }
});
