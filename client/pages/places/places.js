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


map = null

// JQuery stuff
Template.places.rendered = function() {
  self = this;

  // create map
  map = L.mapbox.map('map', 'ramshorst.gd0ekbb3');

  // set map propeties
  map.setView(getCityLocation(Session.get('currentCity')), 11);
  map.zoomControl.setPosition('topleft');

  // layers 
  var featureLayer = L.mapbox.featureLayer();  

  // Set a custom icon on each marker based on feature properties.
  featureLayer.on('layeradd', function(e) {
    var marker = e.layer;

    if (marker.feature.properties.image) {
      marker.setIcon(L.icon({
        iconUrl:      marker.feature.properties.image,
        className:    "marker-hacker",
        iconSize:     [40, 40], // size of the icon
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, 20] // point from which the popup should open relative to the iconAnchor
      }));
    }
  });

  var getActiveFilters = function() {
    return self.$("[filter]:checked").map(function() { 
      return $(this).attr('filter'); 
    });
  }

  // update filters, show markers of activated filters
  var updateFilters = function() {
    var activeFilters = getActiveFilters();
    featureLayer.setFilter(function(feature) {
      return _.contains(activeFilters, feature.properties.filter);
    });
  }

  // filters click handlers
  self.$("[filter]").on('change', updateFilters);
  updateFilters(); // first call


  // load data / add markers
  var geoHackers = featuresOfHackers();
  var geoPlaces = featuresOfPlaces();
  var geojson = geoHackers.concat(geoPlaces);

  featureLayer.setGeoJSON(geojson)
  featureLayer.addTo(map)

}


// create a geojson feature for each hacker 
// who have specified a location in their profile
var featuresOfHackers = function() {

  // create geojson feature object
  var feature = function(user) {
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [user.profile.location.lng, user.profile.location.lat]
      },
      "properties": {
        "name": user.profile.name,
        "filter": "hackers",
        "image": user.profile.picture
      },
    }
  }

  // select only users with specified location
  var selector = {
    "profile.location.lat": {$type: 1}, 
    "profile.location.lng": {$type: 1}
  };
  
  return Users.find(selector).map(feature);
}

var featuresOfPlaces = function() {

  // create geojson feature object
  var feature = function(user) {
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [user.profile.location.lng + 0.1, user.profile.location.lat]
      },
      "properties": {
        "name": user.profile.name,
        "filter": "places"
      },
    }
  }

  // select only users with specified location
  var selector = {
    "profile.location.lat": {$type: 1}, 
    "profile.location.lng": {$type: 1}
  };
  
  return Users.find(selector).map(feature);
}
