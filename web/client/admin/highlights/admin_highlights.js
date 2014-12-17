// Route Controller

AdminHighlightsController = DefaultAdminController.extend({
  template: 'admin_highlights',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [ 
      Meteor.subscribe('highlights', isAdmin ? 'all' : city),
    ];
  }
});


Template.admin_highlights.helpers({
  'collection': function() {
    return Highlights.find().fetch();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.date, 
        Field.city, 
        Field.private, 
        'title', 
        'subtitle', 
        Field.url, 
      ],
    }
  }
});
