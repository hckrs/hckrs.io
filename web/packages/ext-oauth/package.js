Package.describe({
  name: 'ext-oauth',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('oauth');
  api.use('util-url');

  api.addFiles('relax-domain.js', 'server');
  api.addFiles('oauth.js', 'server');

  api.imply('oauth');
});
