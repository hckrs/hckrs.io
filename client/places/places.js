

// tell the template which map we are using
Template.places.helpers({
  'map': function() { return Meteor.settings.public.mapboxPlaces; }
});