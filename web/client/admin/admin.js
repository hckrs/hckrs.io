AdminController = DefaultAdminController.extend({
  onBeforeAction: function() {
    Router.go('admin_hackers');
    this.next();
  }
});

Template.admin_header.helpers({
  'active': function(route) {
    return Router.current().route.name === route ? 'active' : '';
  }
})


Field = {}


/* DATA FIELD functions */

Field.fn = {}

Field.fn.email = function(val, obj) {
  return val ? Safe.email(val, {text: '<span class="glyphicon glyphicon-envelope"></span>'}) : '';
}

Field.fn.url = function(urlField) {
  return function(val, obj) {
    return val ? Safe.url(obj[urlField], {text: val}) : '';
  }
}

Field.fn.date = function(val, obj) {
  return val ? moment(val).fromNow() : '';
}

Field.fn.bool = function(val) {
  return val ? 'YES' : '';
}

Field.fn.avatar = function(val) {
  return val ? Safe.string('<img src="'+val+'" width="50" />') : '';
}




/* DATA FIELD templates */

Field.edit = {
  key: 'id',
  label: 'edit',
  tmpl: Template.reactiveTable_editButton
}

Field.date = {
  key: 'createdAt',
  label: 'date',
  sortByValue: true,
  sort: -1,
  fn: Field.fn.date
}

Field.city = {
  key: 'city',
  label: 'city',
  fn: function(val, obj) {
    var url = Url.replaceCity(val, Meteor.absoluteUrl());
    return Safe.url(url, {text: val});
  }
}

Field.private = {
  key: 'private',
  label: 'private',
  fn: function(val, obj) {
    var icon = val ? 'glyphicon-home' : 'glyphicon-globe';
    return Safe.string('<span class="glyphicon '+icon+'"></span>');
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
