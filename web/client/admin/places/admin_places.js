


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

