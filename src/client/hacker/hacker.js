
/* HACKER 
   - general user info
   - skills & favorites
   - map to pick a location 
   - link external social services
*/


// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hacker = function () { return Session.get('hacker'); }
var hackerId = function () { return Session.get('hackerId'); }




// when user starts typing in an input field
// directly update the user info in the database  
var saveChangedField = function(event) {
  var $elm = $(event.currentTarget); //input element
  var field = $elm.attr('name');
  var value = $elm.val();

  var modifier = {};
  modifier[field] = value;
  Meteor.users.update(Meteor.userId(), {$set: modifier});

  // show feedback on input element
  $elm.addClass('saved');
  Meteor.setTimeout(function() {
    $elm.removeClass('saved');
  }, 1400);
}

// the editing mode will be exited if user press the ESCAPE or RETURN button
var fieldChanged = function(event) {
  var $elm = $(event.currentTarget)
  var keyCode = event.which;
  var ESC = '27', RET = '13';
  if (keyCode == ESC || keyCode == RET)
    $elm.blur()
}

// when address loses focus, check for completness
// if the value isn't complete, clear the input
var addressLosesFocus = function(event) {
  var $elm = $(event.currentTarget)

  // if the return value is an array of jquery elements than there is no match
  // check if we get the correct result by checking the existence of property 'geometry'
  if (!$elm.addresspicker('selected').geometry) { 
    Meteor.users.update(Meteor.userId(), {$set: {'profile.address': null}});
    $elm.val('');
  }
}

// save a completed address
var saveAddress = function(rawData, data) {
  var address = {};
  
  if (data.country)       address.country = data.country;
  if (data.locality)      address.city = data.locality;
  if (data.route)         address.street = data.route;
  if (data.street_number) address.streetNumber = data.street_number;
  if (data.lat)           address.latitude = data.lat();
  if (data.lng)           address.longitude = data.lng();
  if (rawData.value)      address.text = rawData.value;

  Meteor.users.update(Meteor.userId(), {$set: {'profile.address': address}});
}


// EVENTS

Template.hackerEdit.events({
  "blur input.save": saveChangedField,
  "keyup input.save": fieldChanged,
  'blur input.addresspicker': addressLosesFocus
});


// TEMPLATE DATA

Template.hacker.helpers({
  "hackerIsCurrentUser": function() { return Meteor.userId() == hackerId(); },
  "hacker": function() { return hacker(); }
});



// RENDERING


Template.hackerEdit.rendered = function() {
  var options = {
    appendAddressString: "",
    draggableMarker: true,
    regionBias: null, // search results order influenced by current location 'nl', 'fr', etc.
    componentsFilter: '', // only return specific results, e.a. 'country:FR'
    updateCallback: saveAddress,
    reverseGeocode: false,
    autocomplete: 'default', // could be autocomplete: "bootstrap" to use bootstrap typeahead autocomplete instead of jQueryUI
    mapOptions: {
      zoom: 12,
      center: new google.maps.LatLng(45.764043, 4.835659),
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    },
    elements: {
      map: "#map",
    }
  };
  $addressInput = $(this.find('.addresspicker'));
  $addressInput.addresspicker(options);
}

