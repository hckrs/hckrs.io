// Route Controller

AdminGiftsController = DefaultAdminController.extend({
  template: 'admin_gifts',
  waitOn: function () {
    return [ 
      Meteor.subscribe('gifts', 'all'),
    ];
  }
});


Template.admin_gifts.helpers({
  'collection': function() {
    return Gifts.find().fetch();
  },
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.date, 
        Field.city, 
        Field.global, 
        'title', 
        'description', 
        Field.url, 
        'code'
      ],
    }
  }
});
