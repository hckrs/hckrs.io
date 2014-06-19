
DefaultController = RouteController.extend({
  
  onRun: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');

  },
  onBeforeAction: function() {
    
    // wait on global subscriptions ready
    this.wait({ready: Subscriptions.ready}); 
    
  },
  onAfterAction: function() {

    // empty

  },
  onStop: function() {

    // change the style of the navigation header to default, after every route
    Interface.setHeaderStyle('default');

  }
});

