// Route Controller

PlacesController = DefaultController.extend({
  template: 'places',
  waitOn: function () {
    return [
      Meteor.subscribe('places')
    ];
  },
  onAfterAction: function() {
    Interface.setHeaderStyle('fixed');
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
  var featureLayer = L.mapbox.featureLayer().addTo(map);  

  // Set a custom icon on each marker based on feature properties.
  featureLayer.on('layeradd', function(e) {
    var marker = e.layer;

    if (marker.feature.properties.image) {
      marker.setIcon(L.icon({
        iconUrl:      marker.feature.properties.image,
        className:    "marker-hacker",
        iconSize:     [40, 40], // size of the icon
        iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
      }));
    }
  });
  featureLayer.on('mouseover', function(e) {
    e.layer.openPopup();
  });
  featureLayer.on('mouseout', function(e) {
    e.layer.closePopup();
  });
  featureLayer.on('click', function(e) {
    var url = e.layer.feature.properties.url;
    if (url && _.contains(['/','#'], url[0])) // relative url
      Router.go(url);
    else if (url && /^http/.test(url)) // absolute url
      window.open(url)
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

  // load data / add markers
  var reloadData = function() {
    var geoHackers = featuresOfHackers();
    var geoPlaces = featuresOfPlaces();
    var geojson = geoHackers.concat(geoPlaces);
    featureLayer.setGeoJSON(geojson)
  }

  // observer
  this.observer = Places.find({}).observeChanges({
    'added': reloadData,
    'changed': reloadData,
    'removed': reloadData
  });

  // handlers
  self.$("[filter]").on('change', updateFilters);

  // initial call
  updateFilters();
  reloadData();
}

Template.places.destroyed = function() {
  this.observer.stop();
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
        "filter": "hackers",
        "title": user.profile.name,
        "image": user.profile.picture,
        "url": Router.routes['hacker'].path(user)
      },
    }
  }

  // select only users with specified location
  var selector = {
    "city": Session.get('currentCity'),
    "profile.location.lat": {$type: 1}, 
    "profile.location.lng": {$type: 1}
  };
  
  return Users.find(selector).map(feature);
}

var featuresOfPlaces = function() {

  // create geojson feature object
  var feature = function(place) {
    
    return {
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [place.location.lng, place.location.lat]
      },
      "properties": {
        "filter": "places",
        "title": place.title,
        "description": place.description,
        "url": place.url
      },
    }
  }

  return Places.find({}).map(feature);
}
