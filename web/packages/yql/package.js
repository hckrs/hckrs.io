Package.describe({
  name: 'yql',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('util-base');
  api.addFiles('yql.js');
});
