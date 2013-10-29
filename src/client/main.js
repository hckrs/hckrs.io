
/* FRONTPAGE */

// bind total number of hackers to template
Template.frontpage.helpers({
  "totalHackers": function() { return Meteor.users.find().count(); }
})



/* HACKERS list */

// bind hackers to template
Template.hackers.helpers({
  "hackers": function() { return Meteor.users.find().fetch(); }
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


// events
Template.skills.events({
  "click .toggle-skill": function() { userHasSkill(this) ? removeSkill(this) : addSkill(this); },
  "click .toggle-favorite": function() { isFavoriteSkill(this) ? removeFavorite(this) : addFavorite(this); }
});

// bind skills to template
Template.skills.helpers({
  "restSkills": function() { return _.reject(SKILLS, userHasSkill); },
  "userSkills": function() { return _.filter(SKILLS, userHasSkill); },
  "favorite": function() { return isFavoriteSkill(this); }
});

