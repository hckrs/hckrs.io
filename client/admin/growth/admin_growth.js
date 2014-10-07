
// State

var state = new State('adminGrowth', {
  'city': null,
  'composeActive': false,
  'composeSubject': "",
  'composeBody': "",
});


// Route Controller

AdminGrowthController = DefaultAdminController.extend({
  template: 'admin_growth',
  onRun: function() {
    state.set('city', Session.get('currentCity'));
  },
  waitOn: function () {
    return [ 
      // load all github users from the selected city
      Meteor.subscribe('growthGithub', state.get('city')),
      Meteor.subscribe('emailTemplates'), 
    ];
  }
});

// including fields

var fields = function() {
  return [
    Field.city, 
    { key: 'createdAt', label: 'since', sortByValue: true, fn: Field.fn.date},
    { key: 'avatarUrl', label: '#', fn: function(avatarUrl, obj) { return Safe.string('<a href="https://github.com/'+obj['username']+'" target="_blank"><img src="'+avatarUrl+'" width="50" /></a>'); }},
    // 'name',
    'followers',
    'following',
    'repos',
    'gists',
    { key: 'username', label: 'username', sortByValue: true, fn: function(username) { return Safe.url("https://github.com/"+username, {text: username}); }},
    { key: 'hireable', label: 'hire', fn: Field.fn.bool },
    { key: 'biography', label: 'bio', fn: function(bio) { return bio ? Safe.string('<span class="glyphicon glyphicon-leaf" title="'+bio+'" style="cursor:help;"></span>') : ''; } },
    { key: 'company', label: 'comp.', fn: function(company) { return company ? Safe.string('<span class="glyphicon glyphicon-briefcase" title="'+company+'" style="cursor:help;"></span>') : ''; } },
    { key: 'location', label: 'loc.', fn: function(location) { return location ? Safe.string('<span class="glyphicon glyphicon-map-marker" title="'+location+'" style="cursor:help;"></span>') : ''; } },
    
    { key: 'website', label: 'site', sortByValue: true, fn: function(url) { return url ? Safe.url(url, {text: '<span class="glyphicon glyphicon-globe"></span>'}) : ''; }},
    { key: 'email', label: 'email', sortByValue: true, fn: Field.fn.email },
    { key: 'invitedAt', label: 'invited', sortByValue: true, fn: Field.fn.date},
    { key: 'signupAt', label: 'singup', sortByValue: true, fn: Field.fn.date},
  ];
};


// Template helpers

Template.admin_growth.helpers({
  'composeActive': function() {
    return state.get('composeActive');
  },
  'city': function() {
    return CITYMAP[state.get('city')];
  },
  'collection': function() {
    return GrowthGithub.find({city: state.get('city')});
  },
  'settings': function() {
    return {
      showFilter: false,
      showColumnToggles: true,
      rowsPerPage: 50,
      fields: fields(),
    }
  }
});


Template.admin_growthEmail.helpers({
  'subjects': function() {
    return EmailTemplates.find({usedIn: 'growthGithub', subject: {$exists: true}}).map(function(message) {
      return {
        value: message.identifier, 
        label: message.subject.substring(0,70) + (message.subject.length > 70 ? "..." : "")
      };
    });
  },
  'bodies': function() {
    return EmailTemplates.find({usedIn: 'growthGithub', body: {$exists: true}}).map(function(message) {
      return {
        value: message.identifier, 
        label: message.body.substring(0,70) + (message.body.length > 70 ? "..." : "")
      };
    });
  },
  'subject': function() {
    var identifier = state.get('composeSubject');
    var subject = property(EmailTemplates.findOne({identifier: identifier}), 'subject');
    if (subject) return {value: subject, readonly: true};
  },
  'body': function() {
    var identifier = state.get('composeBody');
    var body = property(EmailTemplates.findOne({identifier: identifier}), 'body');
    if (body) return {value: body, readonly: true};
  },
  'schema': function() {
    return new SimpleSchema({
      "selectSubject": { type: String, optional: true, label: "subject" },
      "selectBody": { type: String, optional: true, label: "body" },
      "subject": { type: String },
      "body": { type: String },
    });
  }
})

Template.admin_growth.events({
  'change #growthCityChooser select': function(evt) {
    var city = $(evt.currentTarget).val();
    state.set('city', city);
  },
  'click [action="crawl"]': function(evt) {
    var city = state.get('city');
    Crawler.fetchGithubUsersInCity(city, debug);
  },
  'click [action="compose"]': function(evt) {
    state.set('composeActive', true);
    $(window).scrollTop(0);
  }
})

Template.admin_growthEmail.events({
  'change select#selectSubject': function(evt) {
    var val = $(evt.currentTarget).val();
    state.set('composeSubject', val);
  },
  'change select#selectBody': function(evt) {
    var val = $(evt.currentTarget).val();
    state.set('composeBody', val);
  },
  'click [action="submit"]': function(evt) {
    evt.preventDefault();


    var $button = $(evt.currentTarget);
    var $form = $("#adminGrowthEmailForm");
    var formData = $form.serializeObject(),
        number  = parseInt(formData.number),
        userIds = getUsersFromTop(number),
        options = {
          subject: formData.subject
        , body: formData.body
        , subjectTemplate: formData.selectSubject
        , bodyTemplate: formData.selectBody
        , isNewSubject: !formData.selectSubject
        , isNewBody: !formData.selectBody 
        };

    // validate email
    if (!AutoForm.validateForm("adminGrowthEmailForm"))
      return;

    // disable button for a few seconds
    var text = $button.text();
    $button.attr('disabled', 'disabled').addClass('disabled').text('Sending...');
    var cb = function() {
      $button.removeAttr('disabled').removeClass('disabled').text(text);
      state.set('composeActive', false);
    }
    
    // send mail
    sendGrowthMailing(userIds, options, cb);
  }
})

var getTableInfo = function(fields) {
  // XXX THIS HACKS INTO THE PRIVATE LIB

  // get sorting property from reactive table
  var sortDir = Session.get('reactive-table-reactive-table-sort-direction');
  var sortIdx = Session.get('reactive-table-reactive-table-sort');
  var sortKey = fields[sortIdx].key || fields[sortIdx];

  return {sortDir: sortDir, sortKey: sortKey};
}

var getUsersFromTop = function(number) {
  var table = getTableInfo(fields())
    , city  = state.get('city');

  // get userIds for X number of (uninvited) hackers from top of table
  var selector = {city: city};
  var options = {
    sort: _.object([table.sortKey], [table.sortDir]), 
    limit: number
  };
  console.log(options, GrowthGithub.find(selector, options).fetch())
  return GrowthGithub.find(selector, options).map(_.property('_id'));;
}

var sendGrowthMailing = function(githubUserIds, options, cb) {

  var users = githubUserIds.length;
  var city = state.get('city');

  // preserve line breaks in body
  options.body = options.body.replace(/\n/g, '<br/>');

  // send mail from server
  Meteor.call('githubGrowthMail', city, githubUserIds, options, function(err, res) {
    
    // error handling
    if (err) {
      console.log('Mail failed')
      new PNotify({
        title: 'Mail failed',
        text: "Mailing isn't sent correctly.",
        type: 'error',
        icon: false
      });
    } else {
      console.log('Mail send');  
      new PNotify({
        title: 'Mail sent',
        text: 'E-mail sent to '+users+' users',
        icon: false
      });
    }

    cb(err);
  });
}