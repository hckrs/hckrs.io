Package.describe({
  name: 'ext-email',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('email');
  api.use('settings');
  api.use('collection-users', {unordered: true});

  api.addFiles('email/email-server.jsdoc', 'server');
  api.addFiles('email/email-client.jsdoc', 'client');
  
  api.export('Email', 'client');
});