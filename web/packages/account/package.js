Package.describe({
  name: 'account',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('peerlibrary:async');

  api.use('base');
  api.use('accounts-base');
  api.use('collection-users');
  api.use('collection-invitations');
  api.use('email-transactional');
  api.use('cities');
  api.use('util');
  api.use('ext-oauth');
  
  api.addFiles('account/hooks.js', 'server');
  api.addFiles('account/register-services.js', 'server');
  api.addFiles('account/servicedata.js', 'server');
  api.addFiles('account/userdata.js', 'server');
  api.addFiles('account/account.js', 'server');

  api.export('Account', 'server');
});
