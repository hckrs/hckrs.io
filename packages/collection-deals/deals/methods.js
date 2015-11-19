
/* Methods */

Meteor.methods({
  'updateDealsSort': function(sort) {
    if (!Users.hasAmbassadorPermission()) return;
    DealsSort.upsert({city: Users.myProp('currentCity')}, {$set: {sort: sort}});
  },
  'toggleDealsVisibility': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    var action = toggle === 'off' ? '$addToSet' : '$pull';
    Deals.update(id, _.object([action], [{hiddenIn: Users.myProp('currentCity')}]));
  },
  'toggleDealsPrivacy': function(id, toggle) {
    if (!Users.hasAmbassadorPermission()) return;
    Deals.update(id, {$set: {private: toggle === 'on'}});
  }
})
