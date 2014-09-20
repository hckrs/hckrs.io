// Route Controller

AdminGrowthController = DefaultAdminController.extend({
  template: 'admin_growth',
  waitOn: function () {
    return [ Meteor.subscribe('githubDump') ];
  }
});


Template.admin_growth.helpers({
  'collection': function() {
    return GithubDump.find();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
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
