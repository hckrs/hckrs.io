var state = new State('hackers', {
  filter: {
    hacking: [],
    skills: []
  }
});


// Route Controller

HackersController = DefaultController.extend({
  template: 'hackers',
  waitOn: function () {
    return [ 
      Meteor.subscribe('invitations'),
    ];
  }
});


/* HACKERS list */

var selector = function(inclHidden) {
  var city = Session.get('currentCity');
  var filter = state.get('filter');

  var selector = {
    "city": city
  };

  if (!_.isEmpty(filter.hacking))
    _.extend(selector, {"profile.hacking": {$all: filter.hacking}});

  if (!_.isEmpty(filter.skills))
    _.extend(selector, {"profile.skills": {$all: filter.skills}});
  
  if (!hasAmbassadorPermission() || !inclHidden)
    _.extend(selector, {"isHidden": {$ne: true}});
  
  return selector;
}


/* template data */

Template.hackers.helpers({
  "totalHackers": function() {
    return Meteor.users.find(selector()).count(); 
  },
  "hackerViews": function() { 
    var city = Session.get('currentCity');
    
    var transitionDelay = 0;
    var getUserView = function(user) {
      user = userView(user);
      user.transitionDelay = Math.min(transitionDelay, 1);
      transitionDelay += 0.1
      return user;
    }

    var options = {sort: {isAmbassador: -1, accessAt: -1}};
    return Users.find(selector(true), options).map(getUserView); 
  },
  'hacking': function() {
    var hacking = state.get('filter').hacking;
    var hackingLabels = _.map(hacking, _.partial(getLabel, HACKING_OPTIONS));
    var hackingSentence = sentenceFromList(hackingLabels, ', ', ' and ', '<strong>', '</strong>');    
    return hackingSentence;
  },
  'skills': function() {
    var skillsLabels = state.get('filter').skills;
    var skillsSentence = sentenceFromList(skillsLabels, ', ', ' and ', '<strong>', '</strong>');    
    return skillsSentence;
  }
});

Template.hackersEntry.helpers({
  'hacking': function() {
    return OtherUserProp(this, 'profile.hacking').sort();
  },
  'highlighted': function() {
    return _.contains(state.get('filter').hacking, _.toArray(this).join('')) ? 'highlighted' : '';
  }
})

Template.hackersFilter.helpers({
  'selectedHacking': function() {
    return _.contains(state.get('filter').hacking, this.value) ? 'selected' : '';
  },
  'selectedSkill': function() {
    return _.contains(state.get('filter').skills, this.name) ? 'selected' : '';
  }
});


/* events */

Template.hackersFilter.rendered = function() {
  this.$("select").chosen({search_contains:true}).change(filterFormChanged);
}



/* state */

// when filter changed
// process form input and save state
var filterFormChanged = function(event) {
  var $form = $(event.currentTarget).parents('form:first');
  var formData = $form.serializeObject();
  var items = array(formData.filter);
  
  var filter =_.groupBy(items, function(item){ return /^hacking/.test(item) ? 'hacking' : 'skills'; });
  filter.hacking = _.invoke(filter.hacking, 'replace', /^hacking-/, '');
  filter.skills = _.invoke(filter.skills, 'replace', /^skill-/, '');

  state.set('filter', filter);
}

