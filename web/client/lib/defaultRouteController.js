
DefaultController = RouteController.extend({
  layoutTemplate: "main",
  waitOn: function() {
      return Meteor.subscribe('userData');
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
      Router.go('frontpage');
    else this.next();
  }
});
