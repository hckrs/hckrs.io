Package.describe({
  name: 'email-transactional',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('accounts-base');
  api.use('collection-users');
  api.use('util-url');
  api.use('util-base');
  api.use('cities');
  
  api.addFiles('transactional/config.js', 'server');
  api.addFiles('transactional/new-user.jsdoc', 'server');
  api.addFiles('transactional/verify-email.js', 'server');
});