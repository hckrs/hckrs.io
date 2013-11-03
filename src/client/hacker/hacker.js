
/* HACKER */

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
