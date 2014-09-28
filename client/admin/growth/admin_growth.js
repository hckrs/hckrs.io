// Route Controller

AdminGrowthController = DefaultAdminController.extend({
  template: 'admin_growth',
  waitOn: function () {
    return [ 
      // Meteor.subscribe('githubDump'),
    ];
  }
});


Template.admin_growth.helpers({
  'collection': function() {
    return GithubDump.find({});
  },
  'settings': function() {
    return {
      showFilter: true,
      rowsPerPage: 10,
      fields: [
        Field.city, 
        { key: 'created_at', label: 'since', sortByValue: true, fn: Field.fn.date},
        { key: 'avatar_url', label: '#', fn: Field.fn.avatar},
        'name',
        'followers',
        'following',
        { key: 'login', label: 'username', sortByValue: true, fn: Field.fn.url('url') },
        { key: 'email', label: 'email', sortByValue: true, fn: Field.fn.email },
        { key: '_invitedAt', label: 'invited', sortByValue: true, fn: Field.fn.date},
        { key: '_signupAt', label: 'singup', sortByValue: true, fn: Field.fn.date},
      ],
    }
  }
});


Template.admin_growthEmail.helpers({
  'schema': function() {
    return new SimpleSchema({
      "subject": { type: String },
      "message": { type: String }
    });
  }
})

Template.admin_growthEmail.events({
  'click [action="submit"]': function(evt) {
    evt.preventDefault();

    var $button = $(evt.currentTarget);
    var $form = $("#adminGrowthEmailForm");
    var formData = $form.serializeObject(),
        subject = formData.subject,
        message = formData.message;

    // validate email
    if (!AutoForm.validateForm("adminGrowthEmailForm"))
      return;

    // disable button for a few seconds
    var text = $button.text();
    $button.attr('disabled', 'disabled').addClass('disabled').text('Sending...');
    var cb = function() {
      $button.removeAttr('disabled').removeClass('disabled').text(text);
    }

    var githubUserIds = _.pluck(GithubDump.find({id: 999999999}, {limit: 3, fields: {id: 1}}).fetch(), 'id');
    
    // send mail
    sendGrowthMailing(githubUserIds, subject, message, cb);
  }
})

var sendGrowthMailing = function(githubUserIds, subject, message, cb) {

  var users = githubUserIds.length;

  // preserve line breaks in message
  message = message.replace(/\n/g, '<br/>');

  // send mail from server
  Meteor.call('githubGrowthMail', githubUserIds, subject, message, function(err, res) {
    
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