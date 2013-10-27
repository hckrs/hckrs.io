
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

// check if user has the given skill
var userHasSkill = function(skill) {
  return _.contains(Meteor.user().profile.skills, skill.name);
}

// update user's profile by adding or removing the given skill
var toggleSkill = function(skill) {
  if (userHasSkill(skill)) // remove
    Meteor.users.update(Meteor.userId(), {$pull: {"profile.skills": skill.name}});
  else // add
    Meteor.users.update(Meteor.userId(), {$push: {"profile.skills": skill.name}});
}

// events
Template.skills.events({
  "click .skill": function() { toggleSkill(this); }
});

// bind skills to template
Template.skills.helpers({
  "skills": SKILLS, 
  "active": function() { return userHasSkill(this) ? 'active' : ''; }
});

