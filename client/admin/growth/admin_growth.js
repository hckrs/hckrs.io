
// State

var state = new State('adminGrowth', {
  'city': null,
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
    { key: 'open', label: 'open', sortByValue: true, fn: Field.fn.bool},
    { key: 'clicks', label: 'clicks', sortByValue: true},
    { key: 'signupAt', label: 'singup', sortByValue: true, fn: Field.fn.date},
  ];
};


// Template helpers

Template.admin_growth.helpers({
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


/* Compose Email */

Template.admin_growthEmail.helpers({
  'subjects': function() {
    return EmailTemplates.find({usedIn: 'growthGithub', subject: {$exists: true}}).map(function(message) {
      return { value: message.identifier, label: message.identifier };
    });
  },
  'bodies': function() {
    return EmailTemplates.find({usedIn: 'growthGithub', body: {$exists: true}}).map(function(message) {
      return { value: message.identifier, label: message.identifier };
    });
  },
  'schema': function() {
    return new SimpleSchema({
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
    Crawler.fetchGithubUsersInCity(city, function(err) {
      if (err && err.reason === 'busy')
        alert('Crawler already busy with crawling some city.')
      else if (err)
        debug(err);
    });
  },
})

Template.admin_growthEmail.events({
  'click [action="submit"]': function(evt) {
    evt.preventDefault();

    var tmpl = Template.instance();
    var $button = tmpl.$(evt.currentTarget);
    var $form   = tmpl.$("#adminGrowthEmailForm");

    var formData = $form.serializeObject()
      , number   = parseInt(formData.number)
      , userIds  = getUsersFromTop(number)
      , subjectIdentifier  = formData.subject
      , bodyIdentifier     = formData.body;
    
    // validate email
    if (!AutoForm.validateForm("adminGrowthEmailForm"))
      return;

    // disable button for a few seconds
    var text = $button.text();
    $button.attr('disabled', 'disabled').addClass('disabled').text('Sending...');
    var cb = function() {
      $button.removeAttr('disabled').removeClass('disabled').text(text);
    }
    
    // send mail
    sendGrowthMailing(userIds, subjectIdentifier, bodyIdentifier, cb);
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
  var selector = {
    city: city, 
    invitedAt: {$exists: false}
  };
  var options = {
    sort: _.object([table.sortKey], [table.sortDir]), 
    limit: number
  };

  return GrowthGithub.find(selector, options).map(_.property('_id'));;
}

var sendGrowthMailing = function(githubUserIds, subjectIdentifier, bodyIdentifier, cb) {
  var users = githubUserIds.length;
  var city = state.get('city');

  // send mail from server
  Meteor.call('githubGrowthMail', city, githubUserIds, subjectIdentifier, bodyIdentifier, function(err, res) {
    
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