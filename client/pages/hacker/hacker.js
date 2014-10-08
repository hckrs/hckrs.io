// Route Controller

HackerController = DefaultController.extend({
  template: 'hacker',
  waitOn: function () {
    return [];
  },
  onRun: function() {
    Meteor.autorun(function(c) {
      if (Subscriptions.ready()) {
        console.log(Url.userIdFromUrl(), UserProp('isAccessDenied'))
        Session.set('hackerId', Url.userIdFromUrl());
        Session.set('hackerEditMode', UserProp('isAccessDenied'));  
        c.stop();    
      }
    });
  }
});





/* HACKER 
   - general user info
   - skills & favorites
   - map to pick a location 
   - link external social services
*/


// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hackerId = function () { return Session.get('hackerId'); }
var hackerProp = function(field) { return OtherUserProp(hackerId(), field); }
var hackerProps = function (fields) { return OtherUserProps(hackerId(), fields); }

Template.registerHelper('HackerProp', function(prop) {
  return hackerProp(prop);
});


// DB: checkbox-to-array
// when user check or uncheck a checkboxes it will be saved to the database.
//
// this is how the html is related to the database
// input[name]  --> database field name
// input[value] --> the value to store
// input[checked] --> if checked then add to array or remove otherwise
var addToSet = function(event) {
  var $elm = $(event.currentTarget);
  var field = $elm.attr('name');
  var value = $elm.val();
  var checked = $elm.is(':checked');
  
  exec(function() {
    var action = checked ? '$addToSet' : '$pull';
    var modifier = _.object([ action ], [ _.object([field], [value]) ]);
    Users.update(hackerId(), modifier);

    // log
    if (checked)
      GAnalytics.event("EditProfile", field, value);
  });
}

// DB: input-to-string
// when user input field becomes unfoccused
// update the user info in the database  
//
// this is how the html is related to the database
// input[name]  --> database field name
// input[value] --> the value to store
var saveChangedField = function(event, cb) {
  var $elm = $(event.currentTarget); //input element
  var field = $elm.attr('name');
  var value = $elm.val();
  
  // show feedback on input element
  addTemporaryClass($elm, 'saved');

  exec(function() {
    var modifier = _.object([ value ? '$set' : '$unset' ], [ _.object([field], [value]) ]);
    Users.update(hackerId(), modifier, cb);
  });
}

// the editing mode will be exited if user press the ESCAPE or RETURN button
var fieldChanged = function(event) {
  var $elm = $(event.currentTarget);  //input element
  var keyCode = event.which;
  var ESC = '27', RET = '13';
  if (keyCode == RET)
    $elm.blur()
}



// special case when autosaving email field
// callback after email field updated in the database
var updateEmailCallback = function(err) { 
  Session.set('isDuplicateEmail', false);
  Session.set('isNotValidEmail', false);
  if (err) {
    if (err.reason === "Access denied") { 
      // possible no valid e-mailaddress
      Session.set('isNotValidEmail', true);
    } else {
      // the most possible reason that the update fails is when
      // there is another account with the same e-mailaddress
      Session.set('isDuplicateEmail', true);
    }
  }
}

// show picture choser when user clicked on the current profile picture
// and user is connected to multiple services
var showPictureChoser = function() {
  if (countSocialServices() > 1) {
    var $elm = $("#hacker #profilePicture .picture-choser");
    $elm.addClass('show');
  }
}

// hide picture choser
var hidePictureChoser = function() {
  var $elm = $("#hacker #profilePicture .picture-choser");
  $elm.removeClass('show');
}

// user has selected a profile picture
var pictureChanged = function(event) {
  var $picture = $("#hacker #profilePicture .current-picture .picture");
  var $elm = $(event.currentTarget); //input element
  var value = $elm.val();

  // hide picture-choser
  hidePictureChoser();

  // replace current-image in the template
  $picture.css('background-image', "url('"+value+"')");

  // store in database
  exec(function() {
    Meteor.users.update(hackerId(), {$set: {'profile.picture': value}});
  });
}

var moveCity = function(evt) {
  var city = $(evt.currentTarget).val();
  Meteor.call('moveUserToCity', hackerId(), city, function(err) {
    if (err) return;
    Router.goToCity(city); // redirect to new city
  }); 
}


// count the number of social services the user is connected to
var countSocialServices = function() {
  return _.compact(_.values(hackerProp('profile.social') || {})).length
}

// check if the profile we are viewing is owned by the logged in user
var isCurrentUser = function() {
  return Meteor.userId() == hackerId();
}


// EVENTS

Template.hacker.events({
  "click [action='switch-mode']": function(evt) {
    var mode = $(evt.currentTarget).attr('mode');
    Session.set('hackerEditMode', mode === 'edit');
  },
  "click .button-ready": function(evt) {
    evt.preventDefault();
    checkCompletedProfile();
  },

  // general autosave input fields
  "blur input[autosave]": function(evt) {
    var callback;
    
    // callback after changing email field
    if ($(evt.currentTarget).hasClass('email')) 
      callback = updateEmailCallback;

    saveChangedField(evt, callback);
    
  },
  "keyup input[autosave]": fieldChanged,
  "click input[type='checkbox'][autosave]": addToSet,
});

Template.hackerEdit.events({
  // special input fields
  "click .current-picture": showPictureChoser,
  "mouseleave .picture-choser": hidePictureChoser,
  "click input[name='picture']": pictureChanged,
  "click .toggleService": toggleService,
  "change #citySelect select": moveCity,
});






// TEMPLATE DATA


Template.hacker.helpers({
  'hacker': function() { return hackerProps(); },
  'canEdit': function() { return isCurrentUser() || hasAmbassadorPermission(); },
  'isCurrentUser': function() { return isCurrentUser(); },
  'isEditMode': function() { return Session.get('hackerEditMode'); },
  'activeMode': function(mode) { 
    var currentMode = Session.get('hackerEditMode') ? 'edit' : 'preview';
    return currentMode === mode ? 'active' : '';
  }
});

Template.hackerEdit.helpers({
  'required': function(field) {
    // indicate required field after user try to proceed without filling in this field
    return !pathValue(this, field) && Session.get('isIncompleteProfileError') ? 'required' : '';
  },
  "selected": function(socialPicture) { 
    var isSelected = hackerProp('profile.picture') == socialPicture;
    return  isSelected ? 'checked' : "";
  },
  "checked": function(field, value) {
    var isChecked = _.contains(hackerProp(field), value);
    return isChecked ? 'checked' : "";
  },
  "changePictureAllowed": function() {
    // activate changing social pictures only when connected to multiple services
    return countSocialServices() > 1 ? 'change-allowed' : '';
  },
  "isDuplicateEmail": function() {
    return Session.equals('isDuplicateEmail', true);
  },
  "isNotValidEmail": function() {
    return Session.equals('isNotValidEmail', true);
  },
  "serviceError": function(service) {
    var isServiceError = Session.equals('isAddServiceError_'+service, true);
    return isServiceError ? 'error' : "";
  },
});

Template.hackerView.helpers({
  "urlCurrentUser": function() { 
    return Router.routes['hacker'].url(UserProp("_id")); 
  },
  "isCompanyOrLocation": function() {
    return !!(this.profile.company || this.profile.location);
  }
});


// RENDERING

Template.hackerEdit.rendered = function() {
  initializeAutoGrow();

  if (this.find('#editMap')) {
    var city = CITYMAP[Session.get('currentCity')] || {};
    var latlng = {lat: city.latitude, lng: city.longitude};
    initializeMap(this.find('#editMap'), latlng, hackerProp('profile.location'), true); // initialize map
  }
}

Template.hackerView.rendered = function() {
  if (this.find('#viewMap')) {
    var city = Session.get('currentCity') || {};
    var latlng = {lat: city.latitude, lng: city.longitude};
    initializeMap(this.find('#viewMap'), latlng, hackerProp('profile.location'), false); // initialize map
  }

  // render social follow buttons
  FB.XFBML.parse();
  twttr.widgets.load();
}



