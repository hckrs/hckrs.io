


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
