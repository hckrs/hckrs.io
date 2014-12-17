// Route Controller

AdminPlacesController = DefaultAdminController.extend({
  template: 'admin_places',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [ 
      Meteor.subscribe('places', isAdmin ? 'all' : city),
    ];
  }
});


Template.admin_places.helpers({
  'collection': function() {
    return Places.find().fetch();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.date, 
        Field.city, 
        Field.private,
        'type', 
        'title', 
        'description', 
        Field.url,
      ],
    }
  }
});

