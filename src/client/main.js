/* HACKERS list */

// get a list of all hackers
var getAllHackers = function() {
  return Meteor.users.find().fetch();
}

// bind data of the hackers list to the template
Template.hackers.helpers({
  "hackers": getAllHackers
});