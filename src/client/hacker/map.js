
var mouseTimer = null;
var map;


// initialize the map so the user can pick a location
var initializeMap = function() {

  // Leaflet settings
  L.Icon.Default.imagePath = Meteor.absoluteUrl("img/leaflet");
  
  // set up the map
  map = new L.Map('map');

  // create the tile layer with correct attribution
  // var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  // var osmAttrib='Map data © OpenStreetMap contributors';
  // var osm = new L.TileLayer(osmUrl, {attribution: osmAttrib});   
  // map.addLayer(osm);
  
  // create the tile layer with correct attribution
  var api_key = SETTINGS.CLOUDEMADE_API_KEY;
  var url = 'http://{s}.tile.cloudmade.com/'+api_key+'/997/256/{z}/{x}/{y}.png';
  var attribution = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>';
  var cloudMadeLayer = L.tileLayer(url, {attribution: '', maxZoom: 18});
  map.addLayer(cloudMadeLayer);

  // start the map in Lyon
  map.setView(new L.LatLng(45.764043, 4.835659), 12);

  // marker
  var marker = L.marker([45.764043, 4.835659]).addTo(map);
}

// when mouse enters the map
var enterMap = function(event) {
  var $map = $(event.currentTarget);
  var delay = 500;
  var execute = _.partial(increaseMapSize, $map);
  mouseTimer = Meteor.setTimeout(execute, delay);
} 

// when mouse leaves the map
var leaveMap = function() {
  var $map = $(event.currentTarget);
  if (mouseTimer)
    Meteor.clearTimeout(mouseTimer);
  resetMapSize($map);
} 

// increase the size of the map with animation
var increaseMapSize = function($map) {
  resetMapSize($map); // make sure that previous animation will be canceled

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
    top: startY - 50,
    width: '100%',
    height: '400px'
  }, { step: function() { map.invalidateSize() } });
}

// shrink map to original size
var resetMapSize = function($map) {
  $map.stop(true).css({
    position: 'relative',
    top: 0,
    left: 0,
    width: 'inherit',
    height: 'inherit'
  });
  map.invalidateSize();
}



// EVENTS

Template.hackerEdit.events({
  'mouseenter #map': enterMap,
  'mouseleave #map': leaveMap
});


// RENDERING

Template.hackerEdit.rendered = function() {
  if (!this.initialized)
    initializeMap(); // initialize map
  
  this.initialized = true;
}

