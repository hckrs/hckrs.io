var state = new State('hackers', {
  filter: {
    hacking: [],
    skills: [],
    toolbarOpen: false,
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

Template.hackersFilter.helpers({
  'selectedHacking': function() {
    return _.contains(state.get('filter').hacking, this.value) ? 'selected' : '';
  },
  'selectedSkill': function() {
    return _.contains(state.get('filter').skills, this.name) ? 'selected' : '';
  }
});

Template.hackersToolbar.helpers({
  'active': function() {
    return state.get('toolbarOpen') ? 'active' : '';
  },
  'schema': function() {
    return new SimpleSchema({
      "group": {
        type: String,
        allowedValues: MAILING_VALUES
      },
      "subject": {
        type: String
      },
      "message": {
        type: String
      }
    });
  }
});



/* events */

Template.hackersToolbar.events({
  'change select[name="group"]': function(evt) {
    setTemplate();
  },
  'click [toggle="panel"]': function() {
    state.toggle('toolbarOpen');
    Deps.flush();
    setTemplate();
  },
  'click [type="submit"]': function(evt) {
    evt.preventDefault();
    var $form = $("#hackersNewsletterEditorForm");
    var formData = $form.serializeObject();
    var isPreview = $(evt.currentTarget).attr('preview') === "true";
    var isValid = AutoForm.validateForm("hackersNewsletterEditorForm");
    if (isValid)
      sendMailing(formData, isPreview)
  }
})

Template.hackersFilter.rendered = function() {
  this.$("select").chosen({search_contains:true}).change(filterFormChanged);
}



/* mailing */

var loadEmailTemplate = function(templateName) {
  var tmpl_subject = Template['emailSubject_' + templateName],
      tmpl_message = Template['emailMessage_' + templateName],
      subject = Blaze.toHTML(tmpl_subject),
      message = Blaze.toHTML(tmpl_message, {ambassadorName: "jarno"});
  
  return { subject: subject, message: message };
}

var setTemplate = function() {
  var $mailing = $("#hackersNewsletterEditor"),
      $subject = $mailing.find('[name="subject"]'),
      $message = $mailing.find('[name="message"]'),
      $option = $mailing.find('[name="group"] option:selected'),
      templateName = $option.attr('template'),
      template = loadEmailTemplate(templateName);
  $subject.val(template.subject);
  $message.val(template.message);
}

var sendMailing = function(mail, isTest) {
  Meteor.call('ambassadorMailing', mail, isTest, function(err, res) {
    if (err) return console.log('Mailing failed')
    console.log(isTest ? 'Send test mail' : 'Mailing succeed');
  });
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

