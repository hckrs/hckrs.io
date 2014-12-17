Package.describe({
  name: 'collection-email-templates',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('email-templates/constants.js');
  api.addFiles('email-templates/schema.js');
  api.addFiles('email-templates/allow-deny.js');
  api.addFiles('email-templates/publish.js', 'server');
  
  api.export([
    'EmailTemplates',
    'EMAIL_TEMPLATE_GROUPS_OPTIONS',
    'EMAIL_TEMPLATE_GROUPS_VALUES',
  ]);
});
