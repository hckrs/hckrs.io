// Route Controller

AdminHackersController = DefaultAdminController.extend({
  template: 'admin_hackers',
  waitOn: function () {
    return [ ];
  }
});


Template.admin_hackers.helpers({
  'collection': function() {
    return Users.find().fetch();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.date, 
        Field.city, 
        { key: 'globalId', label: '#', sortByValue: true, fn: function(val, obj) { return Safe.hackerUrl(obj, {text: userRank(obj) ? '#'+userRank(obj) : '-'}); } },
        { key: 'profile.name', label: 'name', sortByValue: true, fn: function(val, obj) { return Safe.hackerUrl(obj, {text: val || '-'}); } },
        { key: 'profile.email', label: 'e-mail', sortByValue: true, fn: Field.fn.email },
        { key: 'invitations', label: 'free invites' },
        { key: '_id', label: 'status',
          fn: function(val, obj) { 
            var labels = userStatusLabel(obj);
            var makeLabel = function(label) { return '<span class="label label-'+label.style+'">'+label.text+'</span>'; }
            return Safe.string(_.map(labels, makeLabel).join('<br/>'));  
          } 
        }
      ],
    }
  }
});
