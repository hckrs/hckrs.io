Package.describe({
  name: 'tmpl-helpers',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('base');
  api.use('util');

  api.addFiles('tmpl-helpers.js', 'client');
});