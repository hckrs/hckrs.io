Package.describe({
  name: 'util-geo',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('cities');
  
  api.addFiles('geo.jsdoc');
  
  api.export('Geo');
});