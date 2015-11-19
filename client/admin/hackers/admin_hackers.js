


Template.admin_hackers.helpers({
  'collection': function() {
    if (Users.hasAdminPermission())
      return Users.find().fetch();
    else
      return Users.find({city: Session.get('currentCity')}).fetch();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.date,
        Field.city,
        { fieldId: 'globalId', key: 'globalId', label: '#', sortByValue: true, fn: function(val, obj) { return Safe.url(Users.userProfileUrl(obj), {text: Users.userRank(obj) ? '#'+Users.userRank(obj) : '-'}); } },
        { fieldId: 'profile.name', key: 'profile.name', label: 'name', sortByValue: true, fn: function(val, obj) { return Safe.url(Users.userProfileUrl(obj), {text: val || '-'}); } },
        { fieldId: 'profile.email', key: 'profile.email', label: 'e-mail', sortByValue: true, fn: Field.fn.email },
        { fieldId: 'invitations', key: 'invitations', label: 'free invites' },
        { fieldId: '_id', key: '_id', label: 'status',
          fn: function(val, obj) {
            var labels = Users.userStatusLabel(obj);
            var makeLabel = function(label) { return '<span class="label label-'+label.style+'">'+label.text+'</span>'; }
            return Safe.string(_.map(labels, makeLabel).join('<br/>'));
          }
        }
      ],
    }
  }
});
