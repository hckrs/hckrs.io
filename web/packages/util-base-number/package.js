Package.describe({
  name: 'util-base-number',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  
  api.addFiles('number.jsdoc');
  
  api.export('Number');
});