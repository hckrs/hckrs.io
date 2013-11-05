
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



// autocomplete address field
// and handles the event when user is selecting an address
var initializeAddressPicker = function($addressInputField) {

  // using a jquery-addresspicker plug-in
  // including a overridden bootstrap-typeahead.js file
  // see reference: https://github.com/elmariachi111/jquery-addresspicker

  var center = new google.maps.LatLng(5.764043, 4.835659); // Lyon
  
  $addressInputField.addresspicker({
    map:      "#map",
    typeaheaddelay: 300,
    draggableMarker: false,
    // regionBias: "fr",
    mapOptions: { // see google maps api reference for possible options
      zoom: 13,
      center: center,
      scrollwheel: false,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
  });

  // helper function to extract useful information from google's response
  var parseGeocodeResult = function(data) {
    var result = { //basic properties
      longitude: data.geometry.location.lng(),
      latitude: data.geometry.location.lat(),
      text: data.formatted_address
    };
    var mapping = { //additional properties
      'street_number': 'streetNumber',
      'route': 'street',
      'postal_code': 'zipcode',
      'locality': 'city',
      'country': 'country',
      'administrative_area_level_1': 'region1',
      'administrative_area_level_2': 'region2'
    };
    _.each(data.address_components, function(component) {
      _.each(component.types, function(type) {
        if (_.contains(_.keys(mapping), type))
          result[mapping[type]] = component.long_name;
      });
    });
    return result;
  }

  // show that the current value isn't valid when user starts editing.
  // only when the user clicks on an address it becomes valid.
  $addressInputField.on('keydown', function() {
    $addressInputField.addClass('invalid');
  });

  // handle event when user is selecting an address
  $addressInputField.on("addressChanged", function(evt, data) {
    $addressInputField.removeClass('invalid');
    var address = parseGeocodeResult(data);
    saveAddress(address);
  });
}


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


// save user's address
var saveAddress = function(address) {
  Meteor.users.update(Meteor.userId(), {$set: {'profile.address': address}});
}



// EVENTS

Template.hackerEdit.events({
  "blur input.save": saveChangedField,
  "keyup input.save": fieldChanged
});


// TEMPLATE DATA

Template.hacker.helpers({
  "hackerIsCurrentUser": function() { return Meteor.userId() == hackerId(); },
  "hacker": function() { return hacker(); }
});



// RENDERING


Template.hackerEdit.rendered = function() {
  // initialize autocomplete address field
  var addressInputField = $(this.find('.addresspicker'));
  initializeAddressPicker(addressInputField);
}

