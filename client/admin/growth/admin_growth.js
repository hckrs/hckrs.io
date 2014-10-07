
// State

var state = new State('adminGrowth', {
  'city': null,
  'composeActive': false,
  'composeSubject': "",
  'composeMessage': "",
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
      Meteor.subscribe('githubDump', state.get('city')),
      Meteor.subscribe('growthMessages'), 
      Meteor.subscribe('growthSubjects'),
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
    return GithubDump.find({city: state.get('city')});
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
    return GrowthSubjects.find({content: {$exists: true}}).map(function(subject) {
      return {
        value: subject._id, 
        label: subject.content.substring(0,70) + (subject.content.length > 70 ? "..." : "")
      };
    });
  },
  'messages': function() {
    return GrowthMessages.find({content: {$exists: true}}).map(function(message) {
      return {
        value: message._id, 
        label: message.content.substring(0,70) + (message.content.length > 70 ? "..." : "")
      };
    });
  },
  'subject': function() {
    var subjectId = state.get('composeSubject');
    var subject = property(GrowthSubjects.findOne(subjectId), 'content');
    if (subject) return {value: subject, readonly: true};
  },
  'message': function() {
    var messageId = state.get('composeMessage');
    var message = property(GrowthMessages.findOne(messageId), 'content');
    if (message) return {value: message, readonly: true};
  },
  'schema': function() {
    return new SimpleSchema({
      "selectSubject": { type: String, optional: true, label: "subject" },
      "selectMessage": { type: String, optional: true, label: "message" },
      "subject": { type: String },
      "message": { type: String },
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
    state.set('composeSubject', val == "New subject template" ? "" : val);
  },
  'change select#selectMessage': function(evt) {
    var val = $(evt.currentTarget).val();
    state.set('composeMessage', val == "New message template" ? "" : val);
  },
  'click [action="submit"]': function(evt) {
    evt.preventDefault();

    var $button = $(evt.currentTarget);
    var $form = $("#adminGrowthEmailForm");
    var formData = $form.serializeObject(),
        subject = formData.subject,
        message = formData.message,
        number  = parseInt(formData.number),
        userIds = getUsersFromTop(number),
        options = {
          isNewSubject: formData.selectSubject == "New subject template"
        , isNewMessage: formData.selectMessage == "New message template" 
        , tmplSubject: formData.selectSubject
        , tmplMessage: formData.selectMessage
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
    sendGrowthMailing(userIds, subject, message, options, cb);
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
  return GithubDump.find(selector, options).map(_.property('_id'));;
}

var sendGrowthMailing = function(githubUserIds, subject, message, options, cb) {

  var users = githubUserIds.length;

  // preserve line breaks in message
  message = message.replace(/\n/g, '<br/>');

  // send mail from server
  Meteor.call('githubGrowthMail', githubUserIds, subject, message, options, function(err, res) {
    
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