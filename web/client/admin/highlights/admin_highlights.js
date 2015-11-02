


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
        {fieldId: 'title', key: 'title', label: 'title'},
        {fieldId: 'subtitle', key: 'subtitle', label: 'subtitle'},
        Field.url,
      ],
    }
  }
});
