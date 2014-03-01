

// tell the template which map we are using
Template.places.helpers({
  'map': function() { return Settings['mapboxPlaces']; }
});