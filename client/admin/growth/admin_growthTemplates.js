// Route Controller

AdminGrowthTemplatesController = DefaultAdminController.extend({
  template: 'admin_growthTemplates',
  waitOn: function () {
    return [ 
      Meteor.subscribe('growthMessages'), 
      Meteor.subscribe('growthSubjects') 
    ];
  }
});

Template.admin_growthTemplates.helpers({
  'subjects': function() {
    return GrowthSubjects.find();
  },
  'messages': function() {
    return GrowthMessages.find();
  },
  'large': function() {
    return this.content.length > 40;
  },
  'short': function() {
    return this.content.substring(0,40) + (this.content.length > 40 ? "..." : "");
  }
})



Template.admin_growthTemplates.events({
  'submit form': function(evt) {
    evt.preventDefault();
    var $target = $(evt.currentTarget);
    var doc = $target.serializeObject();
    var collection = $target.attr('collection');
    var Collection = window[capitaliseFirstLetter(collection)]
    Collection.insert(doc);
  }
})
