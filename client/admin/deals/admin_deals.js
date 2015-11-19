


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
        { fieldId: 'title', key: 'title', label: 'title'},
        { fieldId: 'description', key: 'description', label: 'description'},
        Field.url,
        { fieldId: 'code', key: 'code', label: 'code'},
      ],
    }
  }
});
