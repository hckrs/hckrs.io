// State
var map, featureLayer;

// collection containing only coordinate documents
// representing all hackers from other cities.
var hackersLocations = new Mongo.Collection('mapHackersLocations');

var state = new State("map", {
  city: undefined,          // String
  location: undefined,      // Object {lat: Number, lng, Number}
  zoom: 13,                 // Number
  selected: null,           // Object? {filter: String, id: String}
});

var zoomLevelPictures = 13;




// editor

var editor = new Editor('Places');


// Template data

Template.map.helpers({
  'state': function() { return state; },
  'editor': function() {
    return editor;
  }
});



Template.map.events({
  "click  #PlacesEditor [action='add']": function() {
    var location = _.pick(map.getCenter(), 'lat', 'lng');
    insertPlace(location, function(id) {
      editor.open('edit', id);
    });
  },
  "click #PlacesEditor [action='edit']": function() {

    // select some
    if (!editor.selectedId()) {
      var min = null;
      var minDist = null;
      featureLayer.eachLayer(function(marker) {
        var dist = map.getCenter().distanceTo(marker.getLatLng());
        var isPlace = marker.feature.properties.filter === 'places';
        var permission = Users.hasOwnerPermission(marker.feature.properties);
        if (isPlace && permission && (!min || dist < minDist)) {
          min = marker;
          minDist = dist;
        }
      });
      if (min)
        editor.select(min.feature.properties.id);
    }
  },
});



// Template instance

Template.map.created = function() {
  var city = Session.get('currentCity');
  if (!state.equals('city', city)) {
    state.set('city', city);
    state.set('location', Geo.getCityLocation(city));
    state.set('zoom', state.defaults.zoom);
  }
}


Template.map.rendered = function() {

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

  this.modeObserver = editor.observe('mode', function(mode) {
    reload();
    if (!mode)
      clear();
  });

  this.editorObserver = editor.observe('selectedId', function(id) {
    state.set('selected', id && {id: id, filter: 'places'} || null);
  });

  this.selectedObserver = state.observe('selected', function(selected) {
    openFeaturePopup(featureLayer, selected);
    editor.select(selected && selected.id);
    if (selected)
      clear(selected.id);
  });

  reload();
}

Template.map.destroyed = function() {
  this.dataObserver.stop();
  this.modeObserver.stop();
  this.editorObserver.stop();
  this.selectedObserver.stop();
}




/* Reload */

var reload = function() {
  setData(featureLayer);
  openFeaturePopup(featureLayer, state.get('selected'))
  switchMode(map, featureLayer);
}



/* Setup */

var setupMap = function() {

  var map = L.mapbox.map('mapbox', 'ramshorst.gd0ekbb3');

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
          className:    "marker-place "+type,
          iconSize:     [27, 40], // size of the icon
          iconAnchor:   [13, 40], // point of the icon which will correspond to marker's location
          popupAnchor:  [0, -40] // point from which the popup should open relative to the iconAnchor
        }));

        // make popup
        var popup = [];
        if (props.title)       popup.push("<strong>"+props.title+"</strong>");
        if (props.description) popup.push(props.description);
        if (props.url)         popup.push(Safe.url(props.url));
        marker.bindPopup(popup.join('<br/>'), {closeButton: false, closeOnClick: false, minWidth: 20});
      }

    } else if (props.filter === 'hackers') {
      var user = props.user;

      if (state.get('zoom') >= zoomLevelPictures && user.profile.picture) { // show picture

        // hacker image
        marker.setIcon(L.icon({
          iconUrl:      user.profile.picture,
          className:    "marker-hacker picture",
          iconSize:     [40, 40], // size of the icon
          iconAnchor:   [20, 20], // point of the icon which will correspond to marker's location
          popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
        }));

      } else {

        // hacker point
        marker.setIcon(L.icon({
          iconUrl:      "/img/markers/point.png",
          className:    "marker-hacker point",
          iconSize:     [6, 6], // size of the icon
          iconAnchor:   [3, 3], // point of the icon which will correspond to marker's location
          popupAnchor:  [0, -3] // point from which the popup should open relative to the iconAnchor
        }));
      }

      // make popup
      var html = "";

      if (user.profile.picture)
        html += '<div class="profile-picture" style="background-image:url(\''+user.profile.picture+'\');"></div>';
      html += Safe.url(Users.userProfilePath(user._id), {text: user.profile.name, target: 'self'});

      if (user.profile.companyUrl)
        html += ' @ <span class="company">'+Safe.url(user.profile.companyUrl, {text: user.profile.company, target: 'blank'})+'</span>';
      else if (user.profile.company)
        html += ' @ <span class="company">'+user.profile.company+'</span>';

      if (user.profile.available && user.profile.available.length)
        html += '<div class="available-buttons">'+Blaze.toHTMLWithData(Template.userAvailableButtons, user)+'</div>';

      html += "<div class='clear'></div>";

      marker.bindPopup(html, {closeButton: false, closeOnClick: false, minWidth: 300});

    } else if (props.filter === 'hackers-all') {

      // hacker point
      marker.setIcon(L.icon({
        iconUrl:      "/img/markers/point.png",
        className:    "marker-hacker point",
        iconSize:     [6, 6], // size of the icon
        iconAnchor:   [3, 3], // point of the icon which will correspond to marker's location
        popupAnchor:  [0, -3] // point from which the popup should open relative to the iconAnchor
      }));
    }
  });

  return featureLayer;
}

var setupFilters = function(featureLayer, $) {

  // // which filters are active/checked?
  // var getActiveFilters = function() {
  //   return $("[filter]:checked").map(function() {
  //     return $(this).attr('filter');
  //   });
  // }

  // // update filters, show markers of activated filters
  // var updateFilters = function() {
  //   var activeFilters = getActiveFilters();
  //   featureLayer.setFilter(function(feature) {
  //     return _.contains(activeFilters, feature.properties.filter);
  //   });
  // }

  // // handlers
  // $("[filter]").on('change', updateFilters);

  // // initial call
  // updateFilters();
}

var openFeaturePopup = function(featureLayer, selected) {
  featureLayer.eachLayer(function(marker) {
    var props = marker.feature.properties;
    if (selected && selected.id === props.id) {
      marker.openPopup();

      // ambassador can move markers
      if (Users.hasOwnerPermission(props) && editor.mode() === 'edit' && props.filter === 'places')
        marker.dragging.enable();
    }
    else {
      marker.closePopup();
      marker.dragging.disable();
    }
  });
}


/* Mode */

var switchMode = function(map, featureLayer) {
  resetEvents(map, featureLayer);
  setDefaultEvents(map, featureLayer);
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
  featureLayer.on('click', function(e) {
    var selected = state.get('selected');
    if (selected && selected.id === e.layer.feature.properties.id) {
      state.set('selected', null);
    } else {
      state.set('selected', _.pick(e.layer.feature.properties, 'id', 'filter'));
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

  // dragging
  featureLayer.eachLayer(function(marker) {
    var markerId = marker.feature.properties.id;

    // update location
    marker.on('dragend', function(e) {
      updateLocation(markerId, _.pick(marker.getLatLng(), 'lat', 'lng'));
    });
  });
}




/* Data */

// load data and add markers to map
var setData = function(featureLayer) {
  var geoCityHackers = cityHackersFeatures();
  var geoOtherCityHackers = otherCityHackersFeatures();
  var geoPlaces = placesFeatures();
  var geojson = geoOtherCityHackers.concat(geoCityHackers, geoPlaces);
  featureLayer.setGeoJSON(geojson);
}

// create a geojson feature for each hacker (of the current city)
// who have specified a location in their profile
var cityHackersFeatures = function() {

  // select only users with specified location
  var selector = {
    "city": Session.get('currentCity'),
    "profile.location.lat": {$type: 1},
    "profile.location.lng": {$type: 1},
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
        "user": user,
        "id": user._id,
        // "marker-symbol": "marker-stroked",
        "marker-size": "small",
        "marker-color": "#fff",
      },
    };
  });
}

// create a geojson feature for each hacker (from other cities)
// who have specified a location in their profile
var otherCityHackersFeatures = function() {

  // select only users with specified location
  var selector = {
    "city": {$ne: Session.get('currentCity')},
    "profile.location.lat": {$type: 1},
    "profile.location.lng": {$type: 1},
  };

  return hackersLocations.find().map(function(doc) {
    return {  // geojson feature object
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [doc.lng, doc.lat]
      },
      "properties": {
        "filter": "hackers-all",
        "marker-size": "small",
        "marker-color": "#fff",
      },
    };
  });
}

// create a geojson feature for each place from the Places collection.
var placesFeatures = function() {

  return Places.find(selector()).map(function(place) {
    return { // geojson feature object
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [place.location.lng, place.location.lat]
      },
      "properties": {
        "filter": "places",
        "title": place.title,
        "city": place.city,
        "userId": place.userId,
        "description": place.description,
        "type": place.type,
        "url": place.url,
        "id": place._id,
        "marker-color": "#f00",
      },
    };
  });
}



/* DB */

var selector = function() {
  var city = Session.get('currentCity');
  return Users.hasAmbassadorPermission() ? {} : {hiddenIn: {$ne: city}};
}

// create marker on clicked location
var insertPlace = function(location, cb) {
  Places.insert({location: location}, function(err, id) {
    cb && !err && cb(id);
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
AutoForm.addHooks(editor.formId, {
  beginSubmit: function(formId) {
    var title = $("#"+formId).find("input[name='title']").val();
    if (!title)
      throw "title field is empty";
  }
});

// clear untitled markers
var clear = function(withoutId) {
  Places.find({_id: {$ne: withoutId}, title: {$exists: false}}).forEach(function(place) {
    Places.remove(place._id);
  });
}

