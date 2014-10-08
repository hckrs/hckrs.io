
// observe new registered users
// if some new user signs up (or changes his email address)
// we will check this address is on the growth list
// if so, we attach the userId and mark as signed up.

var checkGrowthEmailAddress = function(userId, email) {

  // find related growth user
  var growthUser = GrowthGithub.findOne({ email: email, signupAt: {$exists: false} });

  // user not related to growth mailing
  if (!growthUser)
    return; 

  // user not related, beacause invitation isn't sent yet
  if (!growthUser.invitedAt)
    return GrowthGithub.remove(growthUser._id) // remove user from growth list

  // mark growth user as signed up
  var modifier = {$set: { signupAt: new Date(), userId: userId }};
  GrowthGithub.update(growthUser._id, modifier);

  console.log('New user signs up after growth mail.')
}

var observeCallback = function(id, fields) {
  var addresses = _.pluck(fields.emails, 'address');
  _.each(addresses, _.partial(checkGrowthEmailAddress, id));
}

Users.find({}, {fields: {'emails': true}}).observeChanges({
  'added': observeCallback,
  'changed': observeCallback
});



