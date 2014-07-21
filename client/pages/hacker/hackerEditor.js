
// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hackerId = function () { return Session.get('hackerId'); }
var hacker = function () { return Users.findOne(hackerId()); }


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
  'keyup, mouseup, change #invitationsNumber': function(evt) {
    var $target = $(evt.currentTarget);
    var invitations = $target.val();
    var userId = hackerId();

    // update invitations count
    Users.update(userId, {$set: {invitations: invitations}});
  },
  "change #citySelect select": function(evt) {
    var city = $(evt.currentTarget).val();
    var cityName = CITYMAP[city].name;
    var userId = hackerId();

    if (confirm("Are you sure you want move this user to '"+cityName+"'?")) {

      // move
      Meteor.call('moveUserToCity', userId, city, function(err, localRank) {

        // redirect to new profile
        var hash = Url.bitHash(localRank);
        var rootUrl = Url.replaceCity(city, Url.baseUrl());
        window.location.href = Meteor.absoluteUrl(hash, {rootUrl: rootUrl});;
      }); 

    } else { 
      
      // cancel, reset <select>
      $(evt.currentTarget).val(Session.get('currentCity'));
    }

  },
  "click [action='email']": function(evt) {
    window.location.href = "mailto:" + hacker().profile.email;
  }
})


Template.hackerEditor.helpers({
  'emailAttr': function() {
    return this.profile.email ? {} : {disabled: ""};
  }
})