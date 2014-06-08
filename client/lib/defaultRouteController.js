
DefaultController = RouteController.extend({
  
  onRun: function() {

    // change the style of the navigation header to default, every route
    Interface.setHeaderStyle('default');

  },
  onBeforeAction: function() {
    
    // subscribe to the global collections
    // this are the collections that must be available on every page
    this.subscribe('publicUserDataCurrentUser', Meteor.userId()).wait();
  
  },
  onAfterAction: function() {

    // empty

  },
  onStop: function() {

    // change the style of the navigation header to default, after every route
    Interface.setHeaderStyle('default');

  }
});

