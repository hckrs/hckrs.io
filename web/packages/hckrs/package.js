Package.describe({
  name: 'hckrs',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs@0.1.5');

  api.imply('base');

  api.imply('account');
  api.imply('util');
  api.imply('cities');
  api.imply('tmpl-helpers');


  // collections
  api.imply('collection-base');
  api.imply('collection-deals');
  api.imply('collection-emails-outbound');
  api.imply('collection-email-templates');
  api.imply('collection-growth');
  api.imply('collection-highlights');
  api.imply('collection-invitations');
  api.imply('collection-migrations');
  api.imply('collection-places');
  api.imply('collection-users');

  // modules
  api.imply('db-migrations');
  api.imply('db-reset');
  api.imply('email-mailing');
  api.imply('email-transactional');
  api.imply('growth');

  // hook-in
  api.imply('ext-oauth');
});
