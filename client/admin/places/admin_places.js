


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
        {fieldId: 'type', key: 'type', label: 'type'},
        {fieldId: 'title', key: 'title', label: 'title'},
        {fieldId: 'description', key: 'description', label: 'description'},
        Field.url,
      ],
    }
  }
});

