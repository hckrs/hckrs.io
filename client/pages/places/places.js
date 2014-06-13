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

