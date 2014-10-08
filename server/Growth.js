
// observe new registered users
// if some new user signs up (or changes his email address)
// we will check this address is on the growth list
// if so, we attach the userId and mark as signed up.

var checkGrowthEmailAddress = function(userId, email) {

  var callback = function(err, success) {
    if (success) 
      console.log('New user signs up after growth mail.')
  }

  GrowthGithub.update({ email: email, signupAt: {$exists: false} }, {
    $set: { signupAt: new Date(), userId: userId }
  }, callback);
}

var observeCallback = function(id, fields) {
  var addresses = _.pluck(fields.emails, 'address');
  _.each(addresses, _.partial(checkGrowthEmailAddress, id));
}

Users.find({}, {fields: {'emails': true}}).observeChanges({
  'added': observeCallback,
  'changed': observeCallback
});



