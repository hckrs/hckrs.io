
var state = new State('adminEmailTemplates', {
  'docId': null,
  'usedIn': [],
});

AdminEmailTemplatesController = DefaultAdminController.extend({
  template: 'admin_emailTemplates',
  waitOn: function () {
    return [ 
      Meteor.subscribe('emailTemplates'),
    ];
  }
});


Template.admin_emailTemplates.helpers({
  'settings': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        Field.edit,
        'identifier', 
        'subject',
        'usedIn', 
      ],
    }
  },
   'collection': function() {
    return EmailTemplates.find();
  },
  'doc': function() {
    return EmailTemplates.findOne(state.get('docId'));
  },
  'type': function() {
    return state.get('docId') ? 'update' : 'insert';
  },
  'usedInOptions': function() {
    return EMAIL_TEMPLATE_USAGE_OPTIONS;
  },
  'vars': function() {
    var usedIn = state.get('usedIn') || [];
    var vars = _.chain(EMAIL_TEMPLATE_USAGE_OPTIONS)
      .filter(function(o) { return _.contains(usedIn, o.value); })
      .pluck('vars').map(function(vars) { return vars ? vars : []; })
      .func(function(a){ return a.length > 1 ? _.reduce(a, _.intersection) : _.first(a) || []; })
      .map(function(v) { return {name: v.toUpperCase()}; })
      .value();
    return vars;
  }
});

Template.admin_emailTemplates.events({
  'change select#usedIn': function(evt) {
    state.set('usedIn', $(evt.currentTarget).val());
  },
  'click [action="new-template"]': function() {
    state.set('docId', null);
  },
  'click [action="edit"]': function() {
    state.set('docId', this._id);
    $(window).scrollTo($("#adminEmailTemplatesForm")) // scroll down
  }
})


Template.admin_emailTemplates.rendered = function() {
  
  // init wysiwyg
  var init = function(content) {
    $('#body').destroy().summernote({
      toolbar: [  
        ['para', ['ul']],
        ['style', ['bold', 'italic', 'underline', 'strikethrough']],
        ['fontsize', ['fontsize']],
        ['color', ['color']],
        ['insert', ['link', 'picture']],
        ['code', ['codeview']],
      ],
      codemirror: { 
        mode: 'text/html',
        htmlMode: true,
        lineNumbers: true,
        theme: 'monokai' 
      },
    }).code(content || '');
  }

  // make sure wysiwyg content is reactive
  this.autorun(function() {
    var doc = EmailTemplates.findOne(state.get('docId'));
    var body = property(doc, 'body');
    init(body);
  });

  // save state about the current selection within usedIn
  this.autorun(function() {
    var doc = EmailTemplates.findOne(state.get('docId'));
    state.set('usedIn', property(doc, 'usedIn') || []);
  });
}

// form hooks

AutoForm.hooks({
  "adminEmailTemplatesForm": {
    before: {
      insert: function(doc, tmpl) { 
        doc.body = tmpl.$('#body').code() // get wysiwyg content
        return doc;
      },
      update: function(docId, modifier, tmpl) { 
        modifier.$set.body = tmpl.$('#body').code(); // get wysiwyg content
        return modifier;
      },
    },
    onSuccess: function() {
      state.set('docId', null);
      $(window).scrollTo(0) // scroll to top
    }
  }
});
