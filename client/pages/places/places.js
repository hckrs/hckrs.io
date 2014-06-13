// Route Controller

PlacesController = DefaultController.extend({
  template: 'places',
  onRun: function() {
    Interface.setHeaderStyle('fixed');
  },
  waitOn: function () {
    return [];
  }
});



// tell the template which map we are using
Template.places.helpers({
  'map': function() { return Settings['mapboxPlaces']; }
});

