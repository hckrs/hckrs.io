AdminController = DefaultAdminController.extend({
  onBeforeAction: function() {
    Router.go('admin_highlights');
  }
});

Template.admin_header.helpers({
  'active': function(route) {
    return Router.current().route.name === route ? 'active' : '';
  }
})


/* SafeString */

Safe = {}

Safe.string = function(str) {
  return new Spacebars.SafeString(str);
}

Safe.url = function(url, name) {
  name = name || url;
  return url ? Safe.string('<a href="'+url+'" target="_blank">'+name+'</a>') : '';
}

Safe.email = function(email, name) {
  name = name || email;
  return email ? Safe.string('<a href="mailto:'+email+'">'+name+'</a>') : '';
}

Safe.hackerUrl = function(id, name) {
  var url = Router.routes['hacker'].url(id);
  return Safe.url(url, name);
}


/* DATA FIELD */


Field = {}

Field.date = {
  key: 'createdAt',
  label: 'date',
  fn: function(val, obj) {
    return moment(val).fromNow();
  }
}

Field.city = {
  key: 'city',
  label: 'city',
  fn: function(val, obj) {
    var url = Url.replaceCity(val, Meteor.absoluteUrl());
    return Safe.url(url, val);
  }
}

Field.global = {
  key: 'global',
  label: 'global',
  fn: function(val, obj) {
    return val ? Safe.string('<span class="icon icon-globe"></span>') : '';
  }
}

Field.url = function(key, name, label) {
  return {
    key: key,
    label: label || 'url',
    fn: function(val, obj) {
      name = (name && obj[name]) || 'link';
      return Safe.url(val, name);
    }
  }
}


/* functions */

Field.fn = {}

Field.fn.email = function(val, obj) {
  return val ? Safe.email(val, 'e-mail') : '';
}



