
/* SKILLS */

// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hackerId = function () { return Session.get('hackerId'); }
var hackerProp = function(field) { return Users.prop(hackerId(), field); }
var hackerProps = function (fields) { return Users.props(hackerId(), fields); }



// helper function to check if user has the given skill
var hackerHasSkill = function(skill) {
  return _.contains(hackerProp('profile.skills'), skill.name);
}

// helper function to check if user has marked the given skill als favorite
var isFavoriteSkill = function(skill) {
  return _.contains(hackerProp('profile.favoriteSkills'), skill.name);
}

// replace all user's skills by the values entered in the chosen-select input field
var updateSkills = function(skillNames) {
  Meteor.users.update(hackerId(), {$set: {"profile.skills": skillNames}});
  cleanFavorites();
}

// mark or unmark a skill as favorite
var addFavorite = function(skill) {
  Meteor.users.update(hackerId(), {$addToSet: {"profile.favoriteSkills": skill.name}}); // add
}
var removeFavorite = function(skill) {
  Meteor.users.update(hackerId(), {$pull: {"profile.favoriteSkills": skill.name}}); // remove
}

// skills that arn't in user's skills list can not be marked as favorite, remove them!
var cleanFavorites = function() {
  var favorites = _.intersection(hackerProp('profile.skills'), hackerProp('profile.favoriteSkills'));
  Meteor.users.update(hackerId(), {$set: {"profile.favoriteSkills": favorites }});
}



// EVENTS

Template.editSkills.events({
  "click .toggle-favorite": function() { isFavoriteSkill(this) ? removeFavorite(this) : addFavorite(this); },
});



// TEMPLATE DATA

Template.skills.helpers({
  "hackerSkills": function() { return _.filter(SKILLS, hackerHasSkill); },
  "isFavorite": function() { return isFavoriteSkill(this); }
});

Template.editSkills.helpers({
  "allSkills": function() { return SKILLS; },
  "hackerSkills": function() { return _.filter(SKILLS, hackerHasSkill); },
  "hasSkill": function() { return hackerHasSkill(this); },
  "selected": function() { return hackerHasSkill(this) ? "selected" : ''; },
  "isFavorite": function() { return isFavoriteSkill(this); }
});



// REDERING 


Template.editSkills.rendered = function() {
  initChosen(); 
}


// init chosen
var initChosen = function() {

  var $chosen = $("#skillSelector").chosen({ 
    search_contains: true 
  });
  
  $chosen.on('change', function(event) {
    var values = $(event.currentTarget).val();
    updateSkills(values);
  });


  // make sure chosen stay opened.
  var chosen = $chosen.data("chosen");
  var _fn = chosen.result_select;
  chosen.result_select = function(evt) {    
      evt["metaKey"] = true;
      evt["ctrlKey"] = true;
      chosen.result_highlight.addClass("result-selected");
      return _fn.call(chosen, evt);
  };
}





