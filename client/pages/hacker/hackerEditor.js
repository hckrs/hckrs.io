
Template.hackerEditor.events({
  'keyup, mouseup, change #invitationsNumber': function(evt) {
    var $target = $(evt.currentTarget);
    var invitations = $target.val();
    var userId = $target.data('userId');

    // update invitations count
    Users.update(userId, {$set: {invitations: invitations}});
  }
})