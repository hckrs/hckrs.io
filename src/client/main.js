
/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { return Meteor.users.find().count(); }
});

// typer text on frontpage
Template.frontpage.rendered = function() {
  var texts = ['node.js','Arduino','design','meteor','UX',
               'hardware','life','backbone.js','mobile'];
  $('#target').teletype({ text: texts }); 
  $('#cursor').teletype({ text: [' ', ' '], delay: 0, pause: 500 });
}



/* HACKERS list */

// bind hackers to template
Template.hackers.helpers({
  "hackers": function() { return Meteor.users.find().fetch(); }
});


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
}

// events
Template.edit.events({
  "keyup input.autosave": updateField
});

// bind hackers to template
Template.hacker.helpers({
  "hacker": function() { return Meteor.users.findOne(this._id); }
});



/* SKILLS */


// helper function to check if user has the given skill
var userHasSkill = function(skill) {
  return _.contains(Meteor.user().profile.skills, skill.name);
}

// helper function to check if user has marked the given skill als favorite
var isFavoriteSkill = function(skill) {
  return _.contains(Meteor.user().profile.favoriteSkills, skill.name);
}

// update user's profile by adding or removing the given (favorite)skill
var addSkill = function(skill) {
  Meteor.users.update(Meteor.userId(), {$addToSet: {"profile.skills": skill.name}}); // add
}
var removeSkill = function(skill) {
  Meteor.users.update(Meteor.userId(), {$pull: {"profile.skills": skill.name}}); // remove
  removeFavorite(skill);
}
var addFavorite = function(skill) {
  Meteor.users.update(Meteor.userId(), {$addToSet: {"profile.favoriteSkills": skill.name}}); // add
  addSkill(skill);
}
var removeFavorite = function(skill) {
  Meteor.users.update(Meteor.userId(), {$pull: {"profile.favoriteSkills": skill.name}}); // remove
}

// replace all user's skills by the values entered in the chosen-select input field
var updateSkills = function(skillNames) {
  Meteor.users.update(Meteor.userId(), {$set: {"profile.skills": skillNames}});
  cleanFavorites();
}

// skills that arn't in user's skills list can be marked as favorite, clean!
var cleanFavorites = function() {
  var profile = Meteor.user().profile.favoriteSkills;
  var favorites = _.intersection(profile.skills, profile.favoriteSkills);
  Meteor.users.update(Meteor.userId(), {$set: {"profile.favoriteSkills": favorites }});
}

// events
Template.editSkills.events({
  "click .toggle-favorite": function() { isFavoriteSkill(this) ? removeFavorite(this) : addFavorite(this); }
});

// bind skills to template 'skills'
Template.skills.helpers({
  "userSkills": function() { return _.filter(SKILLS, userHasSkill); },
  "favorite": function() { return isFavoriteSkill(this); }
});

// bind skills to the template 'editSkills'
Template.editSkills.helpers({
  "allSkills": SKILLS,
  "userSkills": function() { return _.filter(SKILLS, userHasSkill); },
  "hasSkill": function() { return userHasSkill(this); },
  "favorite": function() { return isFavoriteSkill(this); }
});

// after templates is loaded
Template.editSkills.rendered = function() {
  $(".input-skills").chosen().change(function(event) {
    var values = $(event.currentTarget).val();
    updateSkills(values);
  });
}






