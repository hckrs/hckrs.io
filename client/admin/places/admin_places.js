// Route Controller

AdminPlacesController = DefaultAdminController.extend({
  template: 'admin_places',
  waitOn: function () {
    return [ 
      Meteor.subscribe('places'),
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
        'type', 
        'title', 
        'description', 
        Field.url,
      ],
    }
  }
});

