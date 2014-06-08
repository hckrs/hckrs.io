
// Route Controller

MergeAccountController = DefaultController.extend({
  template: 'mergeAccount',
  waitOn: function () {
    return [];
  }
});


Template.mergeAccount.events({
  'click .cancel': function(evt) {
    Session.set('requestMergeDuplicateAccount', false);
    goToEntryPage();
  }
})