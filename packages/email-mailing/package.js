Package.describe({
  name: 'email-mailing',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('peerlibrary:async', 'server');
  api.use('mrt:mailchimp@0.4.0', 'server');

  api.use('base');
  api.use('cities');
  api.use('collection-users');
  api.use('email-templates');
  api.use('util-base');
  
  api.addFiles('mailing/mailing.jsdoc', 'server');
  api.addFiles('mailing/subscriptions.jsdoc', 'server');
  api.addFiles('mailing/send.jsdoc', 'server');

  api.export('Mailing');
});