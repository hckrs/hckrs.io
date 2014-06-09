// Route Controller
// path: "/:localRankHash"

HackerController = DefaultController.extend({
  template: 'hacker',
  waitOn: function () {
    return [ 
      Meteor.subscribe('publicUserDataEmail', userIdentifierFromUrl()) 
    , Meteor.subscribe('publicUserData', userIdentifierFromUrl()) 
    ];
  },
  onBeforeAction: function() { 
    if (!this.ready()) return;
    Session.set('hackerId', userIdFromUrl());
    Session.set('hackerEditMode', true);
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
var hacker = function () { return Users.findOne(hackerId()); }

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
    Meteor.users.update(Meteor.userId(), modifier);

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
    var modifier = _.object([ '$set' ], [ _.object([field], [value]) ]);
    Meteor.users.update(Meteor.userId(), modifier, cb);
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
    Meteor.users.update(Meteor.userId(), {$set: {'profile.picture': value}});
  });
}


// toggle between edit/view mode
var toggleEditMode = function(event) {
  event.preventDefault();
  Session.set('hackerEditMode', !Session.get('hackerEditMode'));
}

// count the number of social services the user is connected to
var countSocialServices = function() {
  return _.compact(_.values(hacker().profile.social || {})).length
}

// check if the profile we are viewing is owned by the logged in user
var isCurrentUser = function() {
  return Meteor.userId() == hackerId();
}


// EVENTS

Template.hacker.events({
  'click .toggle-edit-mode': toggleEditMode
});

Template.hackerEdit.events({
  // general autosave input fields
  "blur input.text.save": function(evt) {
    var callback;
    
    // callback after changing email field
    if ($(evt.currentTarget).hasClass('email')) 
      callback = updateEmailCallback;

    saveChangedField(evt, callback);
    
  },
  "keyup input.text.save": fieldChanged,
  "click input[type='checkbox'].save": addToSet,

  // special input fields
  "click .current-picture": showPictureChoser,
  "mouseleave .picture-choser": hidePictureChoser,
  "click input[name='picture']": pictureChanged,

  "click .toggleService": toggleService,

  "click .button-ready": function(evt) {
    evt.preventDefault();
    checkCompletedProfile();
  },
});



// TEMPLATE DATA

Template.hacker.helpers({
  "hacker": function() { return hacker(); },
  'isCurrentUser': function() { return isCurrentUser(); },
  'editMode': function() { return isCurrentUser() && Session.get('hackerEditMode'); },
});

Template.hackerEdit.helpers({
  "selected": function(socialPicture) { 
    var isSelected = Meteor.user().profile.picture == socialPicture;
    return  isSelected ? 'checked' : "";
  },
  "checked": function(field, value) {
    var isChecked = _.contains(pathValue(Meteor.user(), field), value);
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
  "displayCity": function() {
    return capitaliseFirstLetter('lyon'); // TODO : set right city variable
  },
  "serviceError": function(service) {
    var isServiceError = Session.equals('isAddServiceError_'+service, true);
    return isServiceError ? 'error' : "";
  }
});

Template.hackerView.helpers({
  "checked": function(field, value) {
    var isChecked = _.contains(pathValue(Meteor.user(), field), value);
    return isChecked ? 'checked="checked"' : "";
  },
  "urlCurrentUser": function() { 
    var currentUser = Meteor.user();
    return Router.routes['hacker'].url(currentUser); 
  }
});




// RENDERING

Template.hackerEdit.rendered = function() {
  initializeAutoGrow();
  if (this.find('#editMap')) {
    initializeMap(this.find('#editMap'), Meteor.user(), true); // initialize map
  }
}

Template.hackerView.rendered = function() {
  if (this.find('#viewMap')) {
    initializeMap(this.find('#viewMap'), hacker(), false); // initialize map
  }
}



