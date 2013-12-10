
var $map; // instance to the HTML element containing the map
var map; // instance to the leaflet map
var marker; // marker for user's location
var popup; // popup of the marker
var defaultLocation; // the default location of the map
var zoom = 13; // the default zoom value;
var mouseTimer = null; // delay to increase map
var increasedMode = false; // map is in increased mode


/* 
  TODO XXX: this file need some restructering in the future.
  The functionality is too specific for the edit-profile-pahe.
*/


// initialize the map so the user can pick a location
initializeMap = function(mapElement, user, editable) {
  $map = $(mapElement);
  defaultLocation = { lat: 45.764043, lng: 4.835659 }; // Lyon

  var mapStyle = Meteor.settings.public.mapboxDefault;
  var location = user.profile.location || defaultLocation;

  // map options
  var mapOptions = {
    scrollWheelZoom: false
  };

  // set up the map
  map = L.mapbox.map(mapElement, mapStyle, mapOptions);

  if (editable)
    map.on('click', setMarker);

  // start the map in Lyon
  map.setView(location, zoom);

  // init marker at user's location
  initMarker(location, editable);
}

// show user's location by showing a marker on the map 
var initMarker = function(location, editable) {
  marker = L.marker(location, {draggable: editable});
  marker.on('dragend', markerLocationChanged);
  marker.addTo(map);
  
  if (editable) {
    popup = L.popup({'closeButton': false, 'minWidth': null});
    popup.setContent('<a href="#" class="remove-marker">remove</a>');
    marker.bindPopup(popup);
    popup.on('open', function() {
      // disable popup when no location setted
      if (_.isEqual(marker.getLatLng(), defaultLocation))
        marker.closePopup();
    });
  }
}

// set marker to clicked position
var setMarker = function(event) {
  marker.setLatLng(event.latlng);
  markerLocationChanged(true);
}

// fired when marker location is changed by dragging the marker
var markerLocationChanged = function() {
  var latlng = marker.getLatLng();
  
  if (_.isEqual(latlng, defaultLocation)) { // no location specified
    marker.closePopup();
    marker.setOpacity(0.7);
    removeLocation();
  } else { // location specified, store!
    marker.setOpacity(1);
    saveLocation(latlng);
  }

  // close map with flashing save effect
  addDynamicClass($map, 'before-close-effect', 200);
  Meteor.setTimeout(leaveMap, 500);
}

// removing marker (making it transparant)
var removeMarker = function() {
  marker.setLatLng(defaultLocation);
  markerLocationChanged();
}


/* Increase map size to fullscreen */

// enter fullscreen mode when clicked on the mini map
var enterMap = function(event) {
  if (event && event.preventDefault) event.preventDefault();
  increaseMapSize($map);
  $map.focus();
  Session.set('mapFullscreenActive', true);
} 

// exit fullscreen mode
var leaveMap = function(event) {
  if (event && event.preventDefault) event.preventDefault();
  if (event && event.stopPropagation) event.stopPropagation();
  
  resetMapSize($map);

  $("#hacker .close-map").css('display', 'none'); // direct feedback
  Session.set('mapFullscreenActive', false);
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

  // inital values to make the map floats
  $map.css({
    position: 'fixed',
    top: startY,
    left: $map.offset().left
  });
  
  // increase size with animation 
  $map.animate({
    left: 0,
    top: 0,
    width: '100%',
    height: winHeight
  }, { 
    step: function() { map.invalidateSize(); },
    complete: function() { map.invalidateSize(); }
  });
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

  var location = marker && marker.getLatLng() || defaultLocation;
  map.setView(location, zoom);
  map.invalidateSize();
  
  increasedMode = false;
}



/* DATABASE operations */

var saveLocation = function(location) {
  Meteor.users.update(Meteor.userId(), {$set: {'profile.location': location}});
}

var removeLocation = function() {
  Meteor.users.update(Meteor.userId(), {$unset: {'profile.location': true}});
}


/* EVENTS */

Template.hackerEdit.events({

  // activate fullscreen mode by clicking on the minimap
  'click .event-catch-overlay': enterMap,

  // user clicked on 'remove' in the marker popup
  'click .remove-marker': removeMarker, 

  // closing fullscreen mode by clicking the close-button
  'click .close-map': leaveMap,

  // closing fullscreen mode by typing Escape or Return on the keyboard
  'keydown': function(event) { 
    var $elm = $(event.currentTarget);  //input element
    var keyCode = event.which;
    var ESC = '27', RET = '13';
    if (keyCode == ESC || keyCode == RET)
      leaveMap(event);
  }

});


/* HELPERS */

Template.hackerEdit.helpers({
  'mapFullscreenActive': function() { 
    return Session.get('mapFullscreenActive') ? 'active' : ''; 
  }
})

