Package.describe({
  name: 'ext-email',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('email');
  api.use('settings');

  api.addFiles('email/email-server.js', 'server');
  api.addFiles('email/email-client.js', 'client');
  
  api.export('Email', 'client');
});