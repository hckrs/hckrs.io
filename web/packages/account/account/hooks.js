


// When an user account is created (after user is logging in for the first time)
// extract the important user information and return a new user object where this
// information is associated in user's profile.
// XXX TODO: also update user's profile when user logged in in the future.

Accounts.onCreateUser(function (options, user) {
  user.profile = options.profile;

  // determine which external service is used for account creation
  var serviceName = _.first(_.keys(_.omit(user.services, ['resume'])));

  try {
    // fetch additional user information
    // extend user object with additional fetched user information
    user = UserData.extendUserByFetchingService(user, serviceName);
  } catch(e) {}

  // additional fields
  if (!user.emails)
    user.emails = [];

  // find an existing user that probaly match this identity
  var existingUser = UserData.findExistingUser(user);  


  if (existingUser) { 

    // merge data from existing user if exists
    user = UserData.mergeUserData(existingUser, user);
    Meteor.users.remove(existingUser._id);

  } else { 
    // additional information, for new user only!  

    // don't allow access until user completes his profile
    user.isUninvited = true;
    user.isAccessDenied = true;
    user.isIncompleteProfile = true;
    user.isHidden = true;

    // attach global id
    var maxUser = Users.findOne({}, {fields: {globalId: true}, sort: {globalId: -1}});
    user.globalId = ((maxUser || {}).globalId || 0) + 1;

    // set invitation phrase
    user.invitationPhrase = user.globalId * 2 + 77;

    // give this user the default number of invite codes
    user.invitations = Settings['defaultNumberOfInvitesForNewUsers'] || 0;

    // subscribe user to mailings
    user.mailings = _.chain(MAILING_OPTIONS).where({checked: true}).pluck('value').value();

    // new users on development have direct access and become admin
    if (_.contains(["dev","local"], Settings['environment'])) {
      user.isAdmin = true;
      user.isUninvited = false;
      user.staff = {
        title: "staff", 
        email: "mail@hckrs.io",
      };
    }

  }
  
  // create new user account
  return user; 
});






// check when user tries to login
// we will verify if the user is
Accounts.validateLoginAttempt(function(info) {
  if (!info.user) return;

  var userCity = info.user.city;
  var currentCity = Url.city("http://" + info.connection.httpHeaders.host);

  if (!currentCity) { // try to find closest city based on ip
    var userIp = info.connection.clientAddress;
    var location = Util.requestLocationForIp(userIp);
    currentCity = Util.findClosestCity(location);
  } 
  
  if (!currentCity) { // we can't verify if user is logged in at correct city
    return;
  } else if (!userCity) { // this new user isn't attached to a city yet, attach now!
    Account.moveUserToCity.call({userId: info.user._id}, info.user._id, currentCity);
  } else if (userCity !== currentCity && !info.user.isAdmin) { // check if existing user is logging in at his own city (or is admin)
    throw new Meteor.Error(1, "city unmatch", userCity);
  }
    
  return true;
});
