// Route Controller

AdminDealsController = DefaultAdminController.extend({
  template: 'admin_deals',
  waitOn: function () {
    var city = Session.get('currentCity');
    var isAdmin = Users.hasAdminPermission();
    return [ 
      Meteor.subscribe('deals', isAdmin ? 'all' : city),
    ];
  }
});


Template.admin_deals.helpers({
  'collection': function() {
    return Deals.find().fetch();
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
        'description', 
        Field.url, 
        'code'
      ],
    }
  }
});
