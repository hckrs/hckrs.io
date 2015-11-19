Package.describe({
  name: 'account',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('peerlibrary:async');

  api.use('base');
  api.use('accounts-base');
  api.use('collection-users');
  api.use('collection-invitations');
  api.use('email-transactional');
  api.use('cities');
  api.use('util');
  api.use('util-base');
  api.use('util-geo');
  api.use('util-url');
  api.use('ext-oauth');
  
  api.addFiles('account/account.jsdoc', 'server');
  api.addFiles('account/hooks.jsdoc', 'server');
  api.addFiles('account/register-services.jsdoc', 'server');
  api.addFiles('account/servicedata.jsdoc', 'server');
  api.addFiles('account/userdata.jsdoc', 'server');
  api.addFiles('account/methods.jsdoc', 'server');

  api.export('Account', 'server');
});
