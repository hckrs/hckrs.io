
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
  });
}

// DB: input-to-string
// when user input field becomes unfoccused
// update the user info in the database  
//
// this is how the html is related to the database
// input[name]  --> database field name
// input[value] --> the value to store
var saveChangedField = function(event) {
  var $elm = $(event.currentTarget); //input element
  var field = $elm.attr('name');
  var value = $elm.val();

  // show feedback on input element
  addDynamicClass($elm, 'saved', 1000);

  exec(function() {
    var modifier = _.object([ '$set' ], [ _.object([field], [value]) ]);
    Meteor.users.update(Meteor.userId(), modifier);
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



// send invite to someone 
// so that he can signup for this site
var sendInvite = function(event) {
  event.preventDefault();

  // create invite code
  var code = Invitations.insert({});
  var link = Router.routes['invite'].url({code: code});

  // create mail
  var receiver = ""; //empty
  var subject = "Invite for hckrs.io";
  var message = "Invite Link: "+link;

  // open desktop mail app with example mail
  document.location.href = "mailto:"+receiver+"?subject="+subject+"&body="+message;
}




// EVENTS

Template.hackerEdit.events({

  // general autosave input fields
  "blur input.text.save": saveChangedField,
  "keyup input.text.save": fieldChanged,
  "click input[type='checkbox'].save": addToSet,

  // special input fields
  "click .current-picture": showPictureChoser,
  "mouseleave .picture-choser": hidePictureChoser,
  "click input[name='picture']": pictureChanged,

});

Template.invitations.events({
  'click .invite': sendInvite
})



// TEMPLATE DATA

Template.hacker.helpers({
  "hackerIsCurrentUser": function() { return Meteor.userId() == hackerId(); },
  "hacker": function() { return hacker(); }
});

Template.hackerEdit.helpers({
  "selected": function(socialPicture) { 
    var isSelected = Meteor.user().profile.picture == socialPicture;
    return  isSelected ? 'checked="checked"' : "";
  },
  "checked": function(field, value) {
    var isChecked = _.contains(pathValue(Meteor.user(), field), value);
    return isChecked ? 'checked="checked"' : "";
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

Template.invitations.helpers({
  'numberOfInvitationsLeft': function() {
    var numberSend = Invitations.find().count();
    var limit = Meteor.settings.public.userInvitationLimit;
    return Math.max(0, limit - numberSend);
  },
  'disabled': function() {
    var numberSend = Invitations.find().count();
    var limit = Meteor.settings.public.userInvitationLimit;
    return numberSend >= limit ? 'disabled="disabled"' : '';
  }
})


// RENDERING

Template.hackerEdit.rendered = function() {
  if (!this.initialized)
    initializeMap(this.find('#map')); // initialize map

  this.initialized = true;
}



