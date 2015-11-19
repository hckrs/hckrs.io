Package.describe({
  name: 'util-base-time',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('momentjs:moment');
  
  api.addFiles('time.jsdoc');
  
  api.export('Time');
});