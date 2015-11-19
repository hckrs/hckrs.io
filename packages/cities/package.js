Package.describe({
  name: 'cities',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');

  api.addFiles('cities/cities.js');
  api.addFiles('cities/country-codes.js');
  api.addFiles('cities/export.jsdoc');

  api.export([
    'City'
  ]);
});