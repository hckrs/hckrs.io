

Template.editorForm.helpers({
  'id': function() { return this.formId; },
  'collection': function() { return this.collection; },
  'editActive': function() { return this.active() ? 'active' : ''; },
  'formActive': function() { return this.show(); }, 
  'mode': function() { return this.mode(); }, 
  'action': function() { return this.action(); }, 
  'selected': function() { return this.selected(); }, 
  'disallowed': function() { 
    return !this.selected() || hasOwnerPermission(this.selected()) ? '' : 'disallowed'; 
  },
  'privacy': function() {
    var city = Session.get('currentCity');
    var doc = window[this.collection].findOne({_id: this.selectedId()});
    return {
      icon: doc.private ? 'icon-home' : 'icon-globe',
      attr: {
        action: 'privacy',
        toggle: doc.private ? 'off' : 'on',  
        title: doc.private ? 'Click to make this item available for all cities' : 'Click to make this item only available in ' + CITYMAP[city].name,
      }
    }
  },
  'visibility': function() {
    var city = Session.get('currentCity');
    var isHidden = !!window[this.collection].findOne({_id: this.selectedId(), hiddenIn: city});  
    var txt = isHidden ? 'SHOW' : 'HIDE';
    return {
      icon: isHidden ? 'icon-eye-close' : 'icon-eye-open',
      attr: {
        action: 'visibility',
        toggle: isHidden ? 'on' : 'off',  
        title: 'Click to '+txt+' current item in ' + CITYMAP[city].name,
      }
    }
  }
});


Template.editorForm.events({
  "click [action='add']": function() {
    this.open('add');
  },
  "click [action='edit']": function() {
    this.toggle('edit');
  },
  "click [action='privacy']": function(evt) {
    var toggle = $(evt.currentTarget).attr('toggle');
    var method = 'toggle'+this.collection+'Privacy';
    Meteor.call(method, this.selectedId(), toggle);
  },
  "click [action='visibility']": function(evt) {
    var toggle = $(evt.currentTarget).attr('toggle');
    var method = 'toggle'+this.collection+'Visibility';
    Meteor.call(method, this.selectedId(), toggle);
  },
   "click [action='cancel']": function() {
    this.close();
  },
  "click [action='remove']": function(evt) {
    window[this.collection].remove(this.selectedId());
    this.select(null)
  },
}); 

Template.editorForm.rendered = function() {
  var self = this;
  var editor = self.data;
  Deps.autorun(function(c) {
    editor.show(); /* reactive depend */
    self.$("input:first").blur();
    setTimeout(function() {
      self.$("input:first").focus();
    }, 200);
  });
}



