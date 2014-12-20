Package.describe({
  name: 'util-base-query',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  
  api.addFiles('query.jsdoc');
  
  api.export('Query');
});