
/* Methods */

Meteor.methods({
  'updateHighlightsSort': function(sort) {
    if (!Users.hasAmbassadorPermission()) return;
    HighlightsSort.upsert({city: Users.myProp('currentCity')}, {$set: {sort: sort}});
  },
  'toggleHighlightsVisibility': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Highlights.update(id, _.object([action], [{hiddenIn: Users.myProp('currentCity')}]));
  },
  'toggleHighlightsPrivacy': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    Highlights.update(id, {$set: {private: toggle === 'on'}});
  }
})