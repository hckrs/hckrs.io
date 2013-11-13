
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



// autogrow initiation on text inputs
  $('#text').autoGrowInput({
    comfortZone: 10,
    minWidth: 200,
    maxWidth: 600
});


// when user starts typing in an input field
// directly update the user info in the database  
var saveChangedField = function(event) {
  var $elm = $(event.currentTarget); //input element
  var field = $elm.data('field');
  var value = $elm.val();

  // show feedback on input element
  addDynamicClass($elm, 'saved', 1000);

  exec(function() {
    var modifier = {};
    modifier[field] = value;
    Meteor.users.update(Meteor.userId(), {$set: modifier});
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
  $picture.attr('src', value);

  // store in database
  exec(function() {
    Meteor.users.update(Meteor.userId(), {$set: {'profile.picture': value}});
  });
}

// user has checked which type of hacker he is
var classesChanged = function(event) {
  var $elm = $(event.currentTarget);
  var type = $elm.data('type');
  var checked = $elm.is(':checked');
  
  exec(function() {
    if (checked) // add
      Meteor.users.update(Meteor.userId(), {$addToSet: {'profile.classes': type}});
    else // remove
      Meteor.users.update(Meteor.userId(), {$pull: {'profile.classes': type}});
  });
  
}




// EVENTS

Template.hackerEdit.events({
  "blur input.save": saveChangedField,
  "keyup input.save": fieldChanged,
  "click .current-picture": showPictureChoser,
  "mouseleave .picture-choser": hidePictureChoser,
  "click input[name='picture']": pictureChanged,
  "click input[name='class']": classesChanged
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
  },
  "classChecked": function(type) {
    var isChecked = _.contains(Meteor.user().profile.classes, type);
    return isChecked ? 'checked="checked"' : "";
  }
});





