
/* Methods */

Meteor.methods({
  'togglePlacesVisibility': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Places.update(id, _.object([action], [{hiddenIn: Users.myProp('currentCity')}]));
  },
  'togglePlacesPrivacy': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    Places.update(id, {$set: {private: toggle === 'on'}});
  }
})