

/* QUERY - helpers */


// get some property for a user without other reactive dependencies
// get single value using e.g. Users.prop('isAdmin') => Boolean
Users.prop = function(user, field, options) {
  
  // memorized
  var prop = _.isObject(user) ? Util.property(user, field) : undefined;
  if (!_.isUndefined(prop))
    return prop;
  
  var userId = _.isObject(user) ? user._id : user;
  var opt = {fields: _.object([field], [true])};
  user = Meteor.users.findOne(userId, _.extend(options || {}, opt));
  return Util.property(user, field); 
}

// pick some data from a user without all reactive dependencies
// get obj including fields using e.g. Users.props(['isAdmin','city']) => {_id:..., city:... ,isAdmin:...}
Users.props = function(user, fields, options) {

  // memorized
  if (_.isObject(user) && fields) {
    var userHasProp = function(field) { return !_.isUndefined(Util.property(user, field)); };
    if (_.all(_.union(['_id'], fields), userHasProp))
      return user;
  }

  var userId = _.isObject(user) ? user._id : user;
  var opt = {fields: _.object(fields, _.map(fields, function() { return true; }))};
  return Meteor.users.findOne(userId, _.extend(options || {}, opt));  
}

// get some property from Meteor.user() without other reactive dependencies
// get single value using e.g. Users.myProp('isAdmin') => Boolean
Users.myProp = function(field, options) {
  return Users.prop(Meteor.userId(), field, options);
}

// pick some data from Meteor.user() without all reactive dependencies
// get obj including fields using e.g. Users.myProps(['isAdmin','city']) => {_id:..., city:... ,isAdmin:...}
Users.myProps = function(fields, options) {
  return Users.props(Meteor.userId(), fields, options)
}




/* permission helpers */

Users.isAdmin = function(user) {
  user = user || Meteor.userId();
  return Users.prop(user, 'isAdmin');
}
Users.isAmbassador = function(user, city) {
  if (_.contains(CITYKEYS, user)) {
    city = user;
    user = null;
  }
  user = user || Meteor.userId();
  city = city || (this['Session'] && Session.get('currentCity')) || Users.myProp('currentCity');
  return Users.prop(user, 'isAmbassador') && Users.prop(user, 'city') === city;
}
Users.isOwner = function(user, doc) {
  if (!user) return false;
  if (!doc) {
    doc = user;
    user = Meteor.userId();
  }
  docUserId = _.isObject(doc) ? doc.userId : doc;
  var userId = _.isObject(user) ? user._id : user;
  return docUserId === userId;
}
Users.hasAdminPermission = function(user) {
  return Users.isAdmin(user);
}
Users.hasAmbassadorPermission = function(user, city) {
  return Users.hasAdminPermission(user) || Users.isAmbassador(user, city);
}
Users.hasOwnerPermission = function(user, doc) {
  if (!user) return false;
  if (!doc) {
    doc = user;
    user = Meteor.userId();
  }
  if (!_.isObject(doc)) return;

  if (doc.userId && Users.isOwner(user, doc)) return true;
  else if (doc.city && Users.isAmbassador(user, doc.city)) return true;
  else return Users.isAdmin(user);
}
Users.checkAdminPermission = function(user) {
  if (!Users.hasAmbassadorPermission(user))
    throw new Meteor.Error(500, 'No privilege');
}
Users.checkAmbassadorPermission = function(user, city) {
  if (!Users.hasAmbassadorPermission(user, city))
    throw new Meteor.Error(500, 'No privilege');
}

// check if user is allowed to access the site
// otherwise all database modifier functions will be blocked
Users.allowedAccess = function(userId) {
  var user = Users.findOne(userId);
  return user && user.isAccessDenied != true;
}



/* data helpers */

Users.userView = function(user, additionalFields) {
  user = Users.props(user, _.union(['globalId','profile.name','profile.picture'], additionalFields || []));
  if (user) {
    user.foreign = Users.userIsForeign(user) ? {foreign: "", disabled: ""} : '';
    user.label = Users.userPictureLabel(user);
  }
  return user;
}

Users.userIsForeign = function(user) {
  var city = Users.prop(user, 'city');
  return Util.isForeignCity(city);
}


var _userRanks = {};
Users.userRank = function(user) {
  user = user || Meteor.userId();
  var userId = _.isObject(user) ? user._id : user;

  // calculate
  if (!_userRanks[userId]) {
    var userCity = Users.prop(user, 'city', {reactive: false});
    var memo = function(user, i) { _userRanks[user._id] = i+1; };
    Users.find({city: userCity, isHidden: {$ne: true}}, {sort: {accessAt: 1}, fields: {_id: 1}, reactive: false}).forEach(memo);
  }

  // memo
  return _userRanks[userId];
}

Users.userPictureLabel = function(user) {
  user = user || Meteor.userId();
  var userId = _.isObject(user) ? user._id : user;
  user = Users.props(user, ['city','mergedWith','isDeleted','isAccessDenied','isHidden','isAmbassador','staff'])
  if (user.mergedWith)             return "merged with #"+Users.userRank(user.mergedWith);
  if (user.isDeleted)              return "deleted";
  if (user.isAccessDenied)         return "no access";
  if (user.isHidden)               return "hidden";
  if (Users.userIsForeign(userId))       return CITYMAP[user.city].name;
  if (user.isAmbassador)           return Util.property(user, 'staff.title'); // ambassador displayed as 'admin'
  else                             return "#"+Users.userRank(user);
}

Users.userStatusLabel = function(user) {
  user = user || Meteor.userId();
  user = Users.props(user, undefined); // XXX TODO, SPECIFY fields
  var labels = [];

  var unverifiedEmail = !_.findWhere(user.emails, {address: user.profile.email, verified: true});
  if (user.isUninvited)         labels.push({style: 'important', text: 'not invited'});
  if (!user.profile.name)       labels.push({style: 'important', text: 'no name'});
  if (!user.profile.email)      labels.push({style: 'important', text: 'no email'});
  if (unverifiedEmail)          labels.push({style: 'important', text: 'email unverified'});
  if (user.isIncompleteProfile) labels.push({style: 'warning', text: 'incomplete profile'});
  if (user.isAccessDenied)      labels.push({style: 'warning', text: 'no access'});
  if (user.isHidden)            labels.push({style: 'warning', text: 'hidden'});
  if (user.isAdmin)             labels.push({style: 'success', text: 'admin'});
  if (user.isAmbassador)        labels.push({style: 'success', text: 'ambassador'});
  return labels;
}


Users.userProfilePath = function(user) {
  user = user || Meteor.userId();
  user = Users.props(user, ['city','globalId']);
  if (!user) return "";
  return Url.bitHash(user.globalId);
}

Users.userProfileUrl = function(user) {
  user = user || Meteor.userId();
  user = Users.props(user, ['city','globalId']);
  if (!user) return "";
  var hash = Url.bitHash(user.globalId);
  return Url.replaceCity(user.city, Meteor.absoluteUrl(hash));
}

Users.userInviteUrl = function(user) {
  user = user || Meteor.userId();
  var phrase = Users.prop(user, 'invitationPhrase');
  var bitHash = Url.bitHash(phrase);
  return Router.routes['invite'].url({inviteBitHash: bitHash});
}

Users.userSocialName = function(user, service) {
  var socialUrl = Users.prop(user, 'profile.social.'+service)
  return Util.socialNameFromUrl(service, socialUrl);
}



/* find users */

Users.userForBitHash = function(bitHash) {
  var globalId = Url.bitHashInv(bitHash);
  return Users.findOne({globalId: globalId})
}
