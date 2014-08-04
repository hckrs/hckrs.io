

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
  }
});

Template.visibilityButton.visibility = function() {
  var city = Session.get('currentCity');
  var isHidden = !!window[this.collection].findOne({_id: this.selectedId(), hiddenIn: city});
  return {
    text: isHidden ? 'Hidden' : '',
    icon: isHidden ? 'icon-eye-close' : 'icon-eye-open',
    clss: isHidden ? 'flat' : '',
    attr: {
      action: 'visibility',
      toggle: isHidden ? 'on' : 'off',  
      title: isHidden ? 'Click to make VISIBLE for your users.' : 'Click to HIDE for your users.',
    }
  }
}


Template.editorForm.events({
  "click [action='add']": function() {
    this.open('add');
  },
  "click [action='edit']": function() {
    this.toggle('edit');
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



