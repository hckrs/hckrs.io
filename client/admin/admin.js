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
    return Safe.url(url, {text: val});
  }
}

Field.global = {
  key: 'global',
  label: 'global',
  fn: function(val, obj) {
    return val ? Safe.string('<span class="icon icon-globe"></span>') : '';
  }
}

Field.url = {
  key: 'url',
  label: 'url',
  fn: function(val, obj) {
    text = obj['urlText'] || 'link';
    return Safe.url(val, {text: text});
  }
}


/* functions */

Field.fn = {}

Field.fn.email = function(val, obj) {
  return val ? Safe.email(val, {text: 'e-mail'}) : '';
}



