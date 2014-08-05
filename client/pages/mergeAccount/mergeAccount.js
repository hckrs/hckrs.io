
// Route Controller

MergeAccountController = DefaultController.extend({
  template: 'mergeAccount',
  waitOn: function () {
    return [];
  }
});


Template.mergeAccount.events({
  'click .cancel': function(evt) { // defined in loginService.js
    Session.set('requestMergeDuplicateAccount', false);
    goToEntryPage();
  },
  'click .mergeService': function(evt) { // defined in loginService.js
    toggleService(evt, function() {
      Session.set('requestMergeDuplicateAccount', false);
      goToEntryPage();
    }); 
  }
})