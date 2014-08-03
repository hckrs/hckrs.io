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
        { key: 'localRank', label: '#', fn: function(val, obj) { return Safe.hackerUrl(obj._id, {text: '#'+val}); } },
        { key: 'profile.name', label: 'name', fn: function(val, obj) { return Safe.hackerUrl(obj._id, {text: val}); } },
        { key: 'profile.email', label: 'e-mail', fn: Field.fn.email },
        { key: 'invitations', label: 'free invites' },
        { key: '_id', label: 'status',
          fn: function(val, obj) { 
            var labels = userStatusLabel(obj._id);
            var makeLabel = function(label) { return '<span class="label label-'+label.style+'">'+label.text+'</span>'; }
            return Safe.string(_.map(labels, makeLabel).join('<br/>'));  
          } 
        }
      ],
    }
  }
});
