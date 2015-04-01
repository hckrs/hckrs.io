
var state = new State('locationFinder', {
  "suggestions": []
})

Template.frontpageLocationFinder.rendered = function() {
  var input = this.$("#locationAutoComplete").get(0)
    , autocomplete;

  var options = {
    types: ['(cities)']
  };

  // setup autocomplete
  autocomplete = new google.maps.places.Autocomplete(input, options);

  // event handlers
  var placeChanged = function() {
    var place = autocomplete.getPlace();
    var latlng = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    }
    createSuggestions(latlng);
  }

  var createSuggestions = function(latlng) {

    // get cities nearby the searched location
    var cities = getNearbyCities(latlng);

    // best match
    var best = _.first(cities);

    // If best match is very close (<1km) we choose that city directly
    // otherwise we suggest 3 cities nearby
    if (Geo.getDistanceFromLatLon(latlng.lat, latlng.lng, best.latitude, best.longitude) < 1)
      goToCity(best.key);
    else
      state.set('suggestions', cities);
  }

  var getNearbyCities = function(latlng) {
    var dist = function(city) {
      return Geo.getDistanceFromLatLon(latlng.lat, latlng.lng, city.latitude, city.longitude);
    }
    return _.chain(City.cities()).sortBy(dist).first(3).value();
  }

  // setup events
  google.maps.event.addListener(autocomplete, 'place_changed', placeChanged);

}

Template.frontpageLocationFinder.helpers({
  "displayInput": function() {
    return _.isEmpty(state.get('suggestions')) ? '' : 'none';
  },
  "displaySuggestions": function() {
    return _.isEmpty(state.get('suggestions')) ? 'none' : '';
  },
  "suggestions": function() {
    return state.get('suggestions');
  }
})

Template.frontpageLocationFinder.events({
  "click .close-suggestions" : function(evt, tmpl) {
    state.set('suggestions', []);
    Tracker.afterFlush(function() {
      tmpl.$("#locationAutoComplete").val("").get(0).focus();
    });
  },
  "click .suggestions button": function(evt, tmpl) {
    var city = $(evt.currentTarget).attr('city');
    goToCity(city);
  }
})

var goToCity = function(city) {
  Util.exec(function() {
    Router.goToCity(city);
  });
}

