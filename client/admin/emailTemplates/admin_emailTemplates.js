
var state = new State('adminEmailTemplates', {
  'docId': null,
  'groups': [],
  'previewContent': "",
});


Template.admin_emailTemplates.helpers({
  'tableFormat': function() {
    return {
      showFilter: false,
      rowsPerPage: 500,
      fields: [
        { fieldId: 'groups', key: 'groups', label: 'groups'},
        { fieldId: 'subject', key: 'subject', label: 'subject'},
        { fieldId: 'identifier', key: 'identifier', label: 'identifier'},
        Field.edit,
      ],
    }
  },
  'collection': function() {
    return EmailTemplates.find();
  },
  'doc': function() {
    // Current selected email template, if we try to edit one.
    return EmailTemplates.findOne(state.get('docId'));
  },
  'type': function() {
    // Determine if we modifing an existing item or add a new one.
    return state.get('docId') ? 'update' : 'insert';
  },
  'groupOptions': function() {
    // groups determine at which locations this template can be used
    return EMAIL_TEMPLATE_GROUPS_OPTIONS;
  },
  'mergeVars': function() {
    var groups = state.get('groups') || [];

    // Determine which merge vars can be used. This depends on your
    // selection of groups. Only allow merge vars that can be used
    // in all selected groups.
    var mergeVars = _.chain(EMAIL_TEMPLATE_GROUPS_OPTIONS)
      .filter(function(o) { return _.contains(groups, o.value); })
      .pluck('vars').map(function(vars) { return vars ? vars : []; })
      .func(function(a){ return a.length > 1 ? _.reduce(a, _.intersection) : _.first(a) || []; })
      .map(function(v) { return {name: v}; }).value();

    return mergeVars;
  },
  'previewContent': function() {
    // Render wysiwyg content with filling in example data.
    var tmpl = _.first(state.get('groups') || []);
    var content = state.get('previewContent');
    return Safe.string(renderWithExampleData(content, tmpl));
  }
});

Template.admin_emailTemplates.events({
  'change select#groups': function(evt) {
    state.set('groups', $(evt.currentTarget).val());
  },
  'click [action="new-template"]': function() {
    state.set('docId', null);
  },
  'click [action="edit"]': function() {
    state.set('docId', this._id);
    $(window).scrollTo($("#adminEmailTemplatesForm")) // scroll down
  },
  'click [action="preview"]': function(evt) {
    // Send preview of this template to the staff member
    // (XXX not used right now)

    var city = Session.get('currentCity');
    var tmpl = Template.instance();
    var groups = _.first(state.get('groups') || []);
    var subject = tmpl.$('#subject').val();
    var body = tmpl.$('#body').code();
    var $button = $(evt.currentTarget);

    // replace example data
    body = renderWithExampleData(body, groups);

    // disable button for a few seconds
    var text = $button.text();
    $button.attr('disabled', 'disabled').addClass('disabled').text('Sending...');
    var cb = function(err) {
      $button.removeAttr('disabled').removeClass('disabled').text(text);
      new PNotify({
        title: err ? 'Send preview failed' : 'Send preview',
        type: err ? 'error' : 'success',
        icon: false
      });
    }

    // send preview to staff member
    Email.send({
      to: Object.property(Meteor.user(), 'staff.email'),
      from: Settings["siteEmail"],
      subject: subject,
      html: body,
    }, true, cb);
  }
})


Template.admin_emailTemplates.rendered = function() {
  var tmpl = this;
  var $body = $('#body');

  // wysiwyg content changed
  // update live preview
  var contentChanged = function() {
    state.set('previewContent', $body.code());
  }

  // init wysiwyg
  var init = function(content) {
    var $body = $('#body');
    $body.destroy();
    $body.summernote({
      toolbar: [
        ['style', ['bold', 'italic', 'underline', 'strikethrough', 'fontsize']],
        ['color', ['color']],
        ['clear', ['clear']],
        ['para', ['ul']],
        ['insert', ['link', 'picture']],
        ['code', ['codeview']],
      ],
      codemirror: {
        mode: 'text/html',
        htmlMode: true,
        lineNumbers: true,
        theme: 'monokai'
      },
      onfocus: contentChanged,
      onChange: contentChanged,
    });
    $body.code(content || '');
    contentChanged();
  }

  // make sure wysiwyg content is reactive
  this.autorun(function() {
    var doc = EmailTemplates.findOne(state.get('docId'));
    var body = Object.property(doc, 'body');
    init(body);
  });

  // save current selected groups
  this.autorun(function() {
    var doc = EmailTemplates.findOne(state.get('docId'));
    state.set('groups', Object.property(doc, 'groups') || []);
  });
}


/* form hooks */
AutoForm.hooks({
  // need to extract wysiwyg content
  "adminEmailTemplatesForm": {
    before: {
      insert: function(doc, tmpl) {
        var emailTmpl = _.first(state.get('groups') || []);
        var content = tmpl.$('#body').code()
        doc.body = removeUrlPrefix(content, emailTmpl);
        return doc;
      },
      update: function(docId, modifier, tmpl) {
        var emailTmpl = _.first(state.get('groups') || []);
        var content = tmpl.$('#body').code()
        modifier.$set.body = removeUrlPrefix(content, emailTmpl);
        return modifier;
      },
    },
    onSuccess: function() {
      state.set('docId', null);
      $(window).scrollTo(0) // scroll to top
    }
  }
});


/* helpers */

// The link-dialog will automatically prefix urls with 'http://''
// this is not what we want in the case of *|URL|* variables
// remove the prefix
var removeUrlPrefix = function(content, template) {
  var tmpl = _.findWhere(EMAIL_TEMPLATE_GROUPS_OPTIONS, {value: template});
  var data = Object.property(tmpl || {}, 'example');

  // check if variables is an URL based on the example data
  // if so, we remove possible duplicate http:// prefixes
  _.each(data || {}, function(val, key) {
    if (_.isString(val) && (val.indexOf('http://') === 0 || val.indexOf('https://') === 0)) {
      var regex = new RegExp('http(s?)://\\*\\|'+key+'\\|\\*', 'g');
      content = content.replace(regex, "*|"+key+"|*");
    }
  });

  return content;
}

// fill in merge variables
var renderWithData = function(content, data) {
  _.each(data || {}, function(val, key) {
    var regex = new RegExp('\\*\\|'+key+'\\|\\*', 'g');
    content = content.replace(regex, val);
  });
  return content;
}

// fill in the example merge variables
var renderWithExampleData = function(content, template) {
  var tmpl = _.findWhere(EMAIL_TEMPLATE_GROUPS_OPTIONS, {value: template});
  var example = Object.property(tmpl || {}, 'example');
  return renderWithData(content, example);
}
