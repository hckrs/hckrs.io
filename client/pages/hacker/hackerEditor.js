
// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hackerId = function () { return Session.get('hackerId'); }
var hackerProp = function(field) { return OtherUserProp(hackerId(), field); }
var hackerProps = function (fields) { return OtherUserProps(hackerId(), fields); }


Template.hackerEditor.events({
  "click [action='invite']": function(evt) {
    var by = $(evt.currentTarget).attr('by');
    var userId = hackerId();

    // invite user
    if (by === 'anonymous')
      Meteor.call('inviteUserAnonymous', userId, function(err,res) { console.log(err, res)});
    else
      Meteor.call('inviteUserAmbassador', userId, function(err,res) { console.log(err, res)});
  },
  "click [action='verifyEmail']": function(evt) {
    Meteor.call('forceEmailVerification', hackerId(), function(err) {
      if (err) console.log(err);
    });
  },
  "click [action='sendVerificationEmail']": function() {
    Meteor.call('sendVerificationEmail', hackerId(), function(err) {
      if (err) console.log(err);
    });
  },
  'keyup #invitationsNumber, change #invitationsNumber': function(evt) {
    var $target = $(evt.currentTarget);
    var invitations = $target.val();
    var userId = hackerId();

    // update invitations count
    exec(function() {
      Users.update(userId, {$set: {invitations: invitations}});
    });
  },
  "change #citySelect select": function(evt) {
    var city = $(evt.currentTarget).val();
    var cityName = CITYMAP[city].name;
    var userId = hackerId();
    var userName = hackerProp('profile.name');

    if (confirm("Are you sure you want move this user to '"+cityName+"'?")) {

      // move
      Meteor.call('moveUserToCity', userId, city, function(err) {
        if (err) return;

        new PNotify({
          title: 'Moved to ' + cityName,
          text: 'Moved \'' + userName + '\' to ' + cityName,
          icon: false
        });

        // redirect to hackers page
        Router.go('hackers');
      }); 

    } else { 
      
      // cancel, reset <select>
      $(evt.currentTarget).val(Session.get('currentCity'));
    }

  },
  "click [action='email']": function(evt) {
    window.location.href = "mailto:" + hackerProp('profile.email');
  }
})


Template.hackerEditor.helpers({
  'owner': function() {
    return hackerProp('_id') === Meteor.userId();
  },
  'unverifiedEmail': function() {
    return _.findWhere(hackerProp('emails'), {address: hackerProp('profile.email'), verified: false});
  },
  'statusLabels': function() {
    return userStatusLabel(hackerId());
  }
})