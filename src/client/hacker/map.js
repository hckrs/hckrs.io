
var map; // instance to the leaflet map
var marker; // marker for user's location
var zoom = 13; // the default zoom value;
var mouseTimer = null; // delay to increase map
var increasedMode = false; // map is in increased mode


// initialize the map so the user can pick a location
var initializeMap = function(mapElement) {
  
  // user's location
  var defaultLocation = { lat: 45.764043, lng: 4.835659 }; // Lyon
  var location = Meteor.user().profile.location || defaultLocation;

  // map options
  var mapOptions = {
    scrollWheelZoom: false
  };

  // set up the map
  map = L.mapbox.map('map', SETTINGS.MAPBOX_MAP, mapOptions);

  // start the map in Lyon
  map.setView(location, zoom);

  // init marker at user's location
  initMarker(location);
}

// show user's location by showing a marker on the map 
var initMarker = function(location) {
  marker = L.marker(location, {draggable: true});
  marker.on('dragend', markerLocationChanged);
  marker.addTo(map);
}

// fired when marker location is changed by dragging the marker
var markerLocationChanged = function(event) {
  var marker = event.target;
  var latlng = marker.getLatLng();
  saveLocation(latlng);
}

// when mouse enters the map
var enterMap = function(event) {
  var $map = $(event.currentTarget);
  var delay = 400;
  var execute = _.partial(increaseMapSize, $map);
  mouseTimer = Meteor.setTimeout(execute, delay);
} 

// when mouse leaves the map
var leaveMap = function(event) {
  var $map = $(event.currentTarget);
  if (mouseTimer)
    Meteor.clearTimeout(mouseTimer);
  resetMapSize($map);
} 

// increase the size of the map with animation
var increaseMapSize = function($map) {
  if (increasedMode) 
    return; //already increased

  increasedMode = true;
  map.zoomIn(1, {animate: false});

  // current window properties
  var winHeight = $(window).height();
  var winYMiddle = winHeight/2;

  // current position and height
  var startY = $map.offset().top - $(document).scrollTop();
  var startHeight = $map.height();
  var startYMiddle = startY + startHeight/2;
  var startYBottom = startY + startHeight;
  var startPointY = startYMiddle > winYMiddle ? startYBottom : startY;
  var positionAtScreenRatio = startPointY / winHeight;

  // calculate new position and height
  var newHeight = Math.min(winHeight * 0.8, 400);
  var deltaHeight = newHeight - startHeight;
  var deltaY = -(deltaHeight * positionAtScreenRatio);

  // inital values to make the map floats
  $map.css({
    position: 'fixed',
    top: startY,
    left: $map.offset().left
  });
  
  // increase size with animation 
  $map.animate({
    left: 0,
    top: startY + deltaY,
    width: '100%',
    height: newHeight
  }, { step: function() { map.invalidateSize() } });
}

// shrink map to original size
var resetMapSize = function($map, init) {
  $map.stop(true).css({
    position: 'relative',
    top: 0,
    left: 0,
    width: 'inherit',
    height: 'inherit'
  }); 

  map.setView(marker.getLatLng(), zoom);
  map.invalidateSize();
  
  increasedMode = false;
}



// DATABASE operations

var saveLocation = function(location) {
  Meteor.users.update(Meteor.userId(), {$set: {'profile.location': location}});
}


// EVENTS

Template.hackerEdit.events({
  'mouseenter #map': enterMap,
  'mouseleave #map': leaveMap
});


// RENDERING

Template.hackerEdit.rendered = function() {
  if (!this.initialized)
    initializeMap(this.find('#map')); // initialize map
  
  this.initialized = true;
}

