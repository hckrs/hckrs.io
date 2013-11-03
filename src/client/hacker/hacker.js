
/* HACKER */


// when user starts typing in an input field
// directly update the user info in the database  
var updateField = function(event) {
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

// lose focus when user types the ESCAPE or RETURN within an input field
var checkForBlurEvent = function(event) {
  var $elm = $(event.currentTarget)
  var keyCode = event.which;
  var ESC = '27', RET = '13';
  if (keyCode == ESC || keyCode == RET)
    $elm.blur()
}


// EVENTS

Template.hackerEdit.events({
  "keyup input.autosave": updateField,
  "blur input.save": updateField,
  "keyup input": checkForBlurEvent
});


// TEMPLATE DATA

Template.hacker.helpers({
  "hacker": function() { return Meteor.users.findOne(this._id, {reactive: false}); }
});
Template.hackerEdit.helpers({
  "hacker": function() { return Meteor.users.findOne(this._id, {reactive: false}); }
});
Template.hackerView.helpers({
  "hacker": function() { return Meteor.users.findOne(this._id, {reactive: false}); }
});