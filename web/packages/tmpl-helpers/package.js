Package.describe({
  name: 'tmpl-helpers',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('util');
  api.use('util-base');
  api.use('util-url');
  api.use('cities');

  api.addFiles('tmpl-helpers.jsdoc', 'client');
});