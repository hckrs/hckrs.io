var state = new State('hackers', {
  filter: {
    hacking: [],
    skills: []
  },
  toolbarOpen: false,
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
  
  if (!Users.hasAmbassadorPermission() || !inclHidden)
    _.extend(selector, {"isHidden": {$ne: true}});
  
  return selector;
}


/* template data */

Template.hackers.helpers({
  "total": function() {
    return Meteor.users.find(selector()).count(); 
  },
  "hackerViews": function() { 
    var city = Session.get('currentCity');
    
    var transitionDelay = 0;
    var getUserView = function(user) {
      user = Users.userView(user);
      user.transitionDelay = Math.min(transitionDelay, 1);
      transitionDelay += 0.1
      return user;
    }

    var options = {sort: {isAmbassador: -1, accessAt: -1}};
    return Users.find(selector(true), options).map(getUserView); 
  },
  'hacking': function() {
    var hacking = state.get('filter').hacking;
    var hackingLabels = _.map(hacking, _.partial(Util.getLabel, HACKING_OPTIONS));
    var hackingSentence = String.sentenceFromList(hackingLabels, ', ', ' and ', '<strong>', '</strong>');    
    return hackingSentence;
  },
  'skills': function() {
    var skillsLabels = state.get('filter').skills;
    var skillsSentence = String.sentenceFromList(skillsLabels, ', ', ' and ', '<strong>', '</strong>');    
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
      "subject": { type: String },
      "message": { type: String },
      "group": {
        type: String,
        allowedValues: MAILING_VALUES,
        autoform: {
          type: 'select',
          firstOption: false,
          options: [
            {value: 'local_ambassador_messages', label: 'localMessage'},
            {value: 'local_meetup_announcements', label: 'localMeetup'},
            {value: 'local_meetup_announcements', label: 'localMeetupReminder'},
          ]
        }
      },
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
    Tracker.flush();
    setTemplate();
  },
  'click [action="submit"]': function(evt) {
    evt.preventDefault();
    
    var $button = $(evt.currentTarget);
    var $form = $("#hackersNewsletterEditorForm");
    var formData = $form.serializeObject();
    var isPreview = $button.attr('preview') === "true";
    
    if (!AutoForm.validateForm("hackersNewsletterEditorForm"))
      return;

    // disable button for a few seconds
    var text = $button.text();
    $button.attr('disabled', 'disabled').addClass('disabled').text('Sending...');  
    var cb = function() { 
      $button.removeAttr('disabled').removeClass('disabled').text(text);
    };

    // send mailing
    sendMailing(formData, isPreview, cb);
  }
})

Template.hackersFilter.rendered = function() {
  this.$("select").chosen({search_contains:true}).change(filterFormChanged);
}



/* mailing */

var loadEmailTemplate = function(templateName) {
  var tmpl_subject = Template['emailSubject_' + templateName],
      tmpl_message = Template['emailContent_' + templateName],
      subject = Blaze.toHTML(tmpl_subject),
      message = Blaze.toHTML(tmpl_message);
  
  return { subject: subject, message: message };
}

var setTemplate = function() {
  var $mailing = $("#hackersNewsletterEditor"),
      $subject = $mailing.find('[name="subject"]'),
      $message = $mailing.find('[name="message"]'),
      $option = $mailing.find('[name="group"] option:selected'),
      templateName = $option.text(),
      template = loadEmailTemplate(templateName);
  $subject.val(template.subject);
  $message.val(template.message);
}



var sendMailing = function(mail, isTest, cb) {
  
  // preserve line breaks in message
  mail.message = mail.message.replace(/\n/g, '<br/>');

  // selector (recipient)
  mail.selector = {mailing: mail.group};

  Meteor.call('ambassadorMail', mail, isTest, function(err, res) {
    if (err) {
      console.log('Mailing failed')
      new PNotify({
        title: 'Mail failed',
        text: 'Something went wrong while sending mail.',
        type: 'error',
        icon: false
      });
    } else {
      // done, close toolbar
      if (isTest) {
        console.log('Send test mail');
        new PNotify({
          title: '[TEST] E-mail Sent',
          text: 'You will receive a test e-mail in seconds.',
          icon: false
        });
      } else {
        console.log('Mailing succeed');
        new PNotify({
          title: 'E-mail Sent',
          text: 'To all users of ' + City.lookup(Session.get('currentCity')).name,
          icon: false
        });
        state.set('toolbarOpen', false);
      }
    }
    cb(err);  
  });
}



/* state */

// when filter changed
// process form input and save state
var filterFormChanged = function(event) {
  var $form = $(event.currentTarget).parents('form:first');
  var formData = $form.serializeObject();
  var items = Array.array(formData.filter);
  
  var filter =_.groupBy(items, function(item){ return /^hacking/.test(item) ? 'hacking' : 'skills'; });
  filter.hacking = _.invoke(filter.hacking, 'replace', /^hacking-/, '');
  filter.skills = _.invoke(filter.skills, 'replace', /^skill-/, '');

  state.set('filter', filter);
}

