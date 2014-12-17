Package.describe({
  name: 'collection-places',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('places/constants.js');
  api.addFiles('places/schema.js');
  api.addFiles('places/allow-deny.js');
  api.addFiles('places/publish.js', 'server');
  api.addFiles('places/methods.js', 'server');
  
  api.export([
    'Places',
    'PLACE_TYPE_OPTIONS',
  ]);
});
