// State
var map, featureLayer;

var state = new State("places", {
  city: undefined,          // String
  location: undefined,      // Object {lat: Number, lng, Number}
  zoom: 13,                 // Number
  edit: null,               // String?
  selected: null,           // Object? {filter: String, id: String}
});

var zoomLevelPictures = 14;


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


// Template data

Template.places.helpers({
  'state': function() { return state; },
  'editMode': function() {
    return state.get('edit') ? 'edit-mode' : '';
  }
});

Template.placesEditor.helpers({
  show: function() {
    var edit = state.get('edit');
    var selected = state.get('selected');
    return edit && selected && selected.filter === 'places' ? '' : 'hide';
  },
  'selectedDoc': function() {
    if (state.get('selected'))
      return Places.findOne(state.get('selected').id);  
  },
});


// Template events

Template.places.events({
  "click [action='edit'][type='places']": function (evt) {
    state.set('edit', 'places');
  },
  "click [action='done']": function (evt) {
    evt.preventDefault();
    state.set('edit', null);
  }
});

Template.placesEditor.events({
  "click [action='cancel']": function (evt) {
    state.set('selected', null);
  },
  "click [action='remove']": function (evt) {
    var id = state.get('selected').id;
    removePlace(id);
  }
})


// Template instance

Template.places.created = function() {
  var city = Session.get('currentCity');
  if (!state.equals('city', city)) {
    state.set('city', city);
    state.set('location', getCityLocation(city));
    state.set('zoom', state.defaults.zoom);
  }
}


Template.places.rendered = function() {
  
  // Setup map
  map           =  setupMap();
  featureLayer  =  setupFeatureLayer(map);
                   setupFilters(featureLayer, this.$);

  // Observers

  var initialized = false;
  this.dataObserver = Places.find({}).observeChanges({
    'added': function() { if (initialized) reload(); },
    'changed': function() { if (initialized) reload(); },
    'removed': function() { if (initialized) reload(); }
  });
  initialized = true;

  this.editObserver = state.observe('edit', function(mode) {
    reload();
    state.set('selected', null);
    clear();
  });

  this.selectedObserver = state.observe('selected', function(selected) {
    openFeaturePopup(featureLayer, selected);
    clear();
  });

  reload();
}

Template.places.destroyed = function() {
  this.dataObserver.stop();
  this.editObserver.stop();
  this.selectedObserver.stop();
}


/* Reload */

var reload = function() {
  setData(featureLayer);
  switchMode(map, featureLayer, state.get('edit'));
}



/* Setup */

var setupMap = function() {

  var map = L.mapbox.map('map', 'ramshorst.gd0ekbb3');

  // properties
  map.setView(state.get('location'));
  map.setZoom(state.get('zoom'));
  map.zoomControl.setPosition('topleft');

  // events
  map.on('moveend', function(e) {  // save location state
    state.set('location', map.getCenter())
  });
  map.on('zoomend', function(e) { // save zoom state
    var prevZoom = state.get('zoom');
    var newZoom = map.getZoom();
    
    // save zoom level
    state.set('zoom', newZoom)

    // reload data when certain zoom level is passed
    if (newZoom < zoomLevelPictures && zoomLevelPictures <= prevZoom
      || newZoom >= zoomLevelPictures && zoomLevelPictures > prevZoom) {
      reload(); 
    }
  });

  return map;
}

var setupFeatureLayer = function(map) {

  // create marker layer
  var featureLayer = L.mapbox.featureLayer().addTo(map);  

  // icon based on feature properties
  featureLayer.on('layeradd', function(e) {
    var marker = e.layer;
    var props = marker.feature.properties;
    var type = props.type;
    
    if (props.filter === 'places') {

      // places marker
      if (type) {
        marker.setIcon(L.icon({
          iconUrl:      "/img/markers/"+type+".png",
          className:    "marker-place marker-"+type,
          iconSize:     [27, 40], // size of the icon
          iconAnchor:   [13, 40], // point of the icon which will correspond to marker's location
          popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        }));
      }
    
    } else if (props.filter === 'hackers') {
      
      if (state.get('zoom') >= zoomLevelPictures && props.image) { // show picture

        // hacker image
        marker.setIcon(L.icon({
          iconUrl:      props.image,
          className:    "marker-hacker",
          iconSize:     [40, 40], // size of the icon
          iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
          popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
        }));

      } else {
        marker.setOpacity(0.5);
      }
    }
  });

  return featureLayer;
}

var setupFilters = function(featureLayer, $) {

  // which filters are active/checked?
  var getActiveFilters = function() {
    return $("[filter]:checked").map(function() { 
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

  // handlers
  $("[filter]").on('change', updateFilters);

  // initial call
  updateFilters();
}

var openFeaturePopup = function(featureLayer, selected) {
  featureLayer.eachLayer(function(marker) {
    var props = marker.feature.properties;
    if (selected && selected.id === props.id)
      marker.openPopup();
    else
      marker.closePopup();
  });
}


/* Mode */

var switchMode = function(map, featureLayer, editMode) {

  resetEvents(map, featureLayer);

  if (editMode) {

    // edit mode
    setEditEvents(map, featureLayer);
    featureLayer.eachLayer(function(marker) {
      if (marker.feature.properties.filter === 'places')
        marker.dragging.enable()
    });

  } else {

    // view mode
    setDefaultEvents(map, featureLayer);
    featureLayer.eachLayer(function(marker) {
      marker.dragging.disable()
    });
  }
  
}


/* Events */

var resetEvents = function(map, featureLayer) {
  map.off('click');
  featureLayer.off('mouseover');
  featureLayer.off('mouseout');
  featureLayer.off('click');
  featureLayer.eachLayer(function(marker) {
    marker.off('dragend');
  });
}

var setDefaultEvents = function(map, featureLayer) {
  featureLayer.on('mouseover', function(e) {
    e.layer.openPopup();
  });
  featureLayer.on('mouseout', function(e) {
    e.layer.closePopup();
  });
  featureLayer.on('click', function(e) {
    e.layer.openPopup();
    var url = e.layer.feature.properties.url;
    if (url && _.contains(['/','#'], url[0])) // relative url
      Router.go(url);
    else if (url && /^http/.test(url)) // absolute url
      window.open(url)
  });
}

var setEditEvents = function(map, featureLayer) {
  
  var timer;
  map.on('click', function(e) {

    var createMarker = function() {
      var location = _.pick(e.latlng, 'lat', 'lng');
      insertPlace(location);
      timer = null;
    }
    
    if (timer) { // skip double click  
      clearTimeout(timer);
      timer = null;
    } else {
      timer = setTimeout(createMarker, 350);
    }
    
  });
  featureLayer.on('mouseover', function(e) {
    if (state.get('selected')) return;
    e.layer.openPopup();
  });
  featureLayer.on('mouseout', function(e) {
    if (state.get('selected')) return;
    e.layer.closePopup();
  });
  featureLayer.on('click', function(e) {
    e.layer.openPopup();
    state.set('selected', _.pick(e.layer.feature.properties, 'id', 'filter'));
  });
  featureLayer.eachLayer(function(marker) {
    marker.on('dragend', function(e) {
      var location = _.pick(marker.getLatLng(), 'lat', 'lng');
      updateLocation(marker.feature.properties.id, location);
    });
  });
}


/* Data */

// load data and add markers to map
var setData = function(featureLayer) {
  var geoHackers = hackersFeatures();
  var geoPlaces = placesFeatures();
  var geojson = geoHackers.concat(geoPlaces);
  featureLayer.setGeoJSON(geojson);
}

// create a geojson feature for each hacker 
// who have specified a location in their profile
var hackersFeatures = function() {

  // select only users with specified location
  var selector = {
    "city": Session.get('currentCity'),
    "profile.location.lat": {$type: 1}, 
    "profile.location.lng": {$type: 1}
  };
   
  return Users.find(selector).map(function(user) {
    return {  // geojson feature object
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [user.profile.location.lng, user.profile.location.lat]
      },
      "properties": {
        "filter": "hackers",
        "title": user.profile.name,
        "image": user.profile.picture,
        "url": Router.routes['hacker'].path(user),
        "id": user._id,
        // "marker-symbol": "marker-stroked",
        "marker-size": "small",
        "marker-color": "#fff",
      },
    };
  });
}

// create a geojson feature for each place from the Places collection.
var placesFeatures = function() {

  return Places.find({}).map(function(place) {
    return { // geojson feature object
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [place.location.lng, place.location.lat]
      },
      "properties": {
        "filter": "places",
        "title": place.title,
        "description": _.compact([place.description, place.url]).join('<br/>'),
        "type": place.type,
        "url": place.url,
        "id": place._id
      },
    };
  });
}



/* DB */

// create marker on clicked location
var insertPlace = function(location) {
  Places.insert({location: location}, function(err, id) {
    state.set('selected', {filter: "places", id: id});
  });
}

// remove marker
var removePlace = function(id) {
  state.set('selected', null);
  Places.remove(id);
}

// update location of selected place
var updateLocation = function(id, location) {
  Places.update(id, {$set: {location: location}});
}

// deselect after submit form
AutoForm.addHooks('placesEditorForm', {
  beginSubmit: function(formId) {
    var title = $("#"+formId).find("input[name='title']").val();
    if (!title)
      throw "title field is empty";
  },
  onSuccess: function() {
    state.set('selected', null);
  }
});

// clear untitled markers
var clear = function() {
  var selectedId = state.get('selected') && state.get('selected').id;
  Places.find({_id: {$ne: selectedId}, title: {$exists: false}}).forEach(function(place) {
    Places.remove(place._id);
  });
}

