Package.describe({
  name: 'ext-random',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('random');
  api.addFiles('random.js');
});
