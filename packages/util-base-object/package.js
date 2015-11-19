Package.describe({
  name: 'util-base-object',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  
  api.addFiles('object.jsdoc');
  
  api.export('Object');
});