
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

  var center = new google.maps.LatLng(45.764043, 4.835659); // Lyon
  
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
    addDynamicClass($addressInputField, 'saved', 1000); // show feedback on input element
  });
}


// when user starts typing in an input field
// directly update the user info in the database  
var saveChangedField = function(event) {
  var $elm = $(event.currentTarget); //input element
  var field = $elm.data('field');
  var value = $elm.val();

  var modifier = {};
  modifier[field] = value;
  Meteor.users.update(Meteor.userId(), {$set: modifier});

  // show feedback on input element
  addDynamicClass($elm, 'saved', 1000);
}

// the editing mode will be exited if user press the ESCAPE or RETURN button
var fieldChanged = function(event) {
  var $elm = $(event.currentTarget);  //input element
  var keyCode = event.which;
  var ESC = '27', RET = '13';
  if (keyCode == RET)
    $elm.blur()
}

// show picture choser when user clicked on the current profile picture
var showPictureChoser = function() {
  var $elm = $("#hacker #profilePicture .picture-choser");
  addDynamicClass($elm, 'show');
}

// hide picture choser
var hidePictureChoser = function() {
  var $elm = $("#hacker #profilePicture .picture-choser");
  removeDynamicClass($elm, 'show');
}

// user has selected a profile picture
var pictureChanged = function(event) {
  var $picture = $("#hacker #profilePicture .current-picture img.picture");
  var $elm = $(event.currentTarget); //input element
  var value = $elm.val();

  // hide picture-choser
  hidePictureChoser();

  // replace current-image in the template
  $picture.attr('src', value);

  // store in database
  Meteor.users.update(Meteor.userId(), {$set: {'profile.picture': value}});
}

// save user's address
var saveAddress = function(address) {
  Meteor.users.update(Meteor.userId(), {$set: {'profile.address': address}});
}



// EVENTS

Template.hackerEdit.events({
  "blur input.save": saveChangedField,
  "keyup input.save": fieldChanged,
  "click .current-picture": showPictureChoser,
  "mouseleave .picture-choser": hidePictureChoser,
  "click input[name='picture']": pictureChanged
});


// TEMPLATE DATA

Template.hacker.helpers({
  "hackerIsCurrentUser": function() { return Meteor.userId() == hackerId(); },
  "hacker": function() { return hacker(); }
});

Template.hackerEdit.helpers({
  "selected": function(socialPicture) { 
    var isSelected = Meteor.user().profile.picture == socialPicture;
    return  isSelected ? 'checked="checked"' : "";
  }
});



// RENDERING


Template.hackerEdit.rendered = function() {
  if (!this.initialized) {
    // initialize autocomplete address field
    var addressInputField = $(this.find('.addresspicker'));
    initializeAddressPicker(addressInputField);
  }

  this.initialized = true;
}

