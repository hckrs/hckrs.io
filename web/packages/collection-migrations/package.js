Package.describe({
  name: 'collection-migrations',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('migrations/schema.js', 'server');
  api.addFiles('migrations/allow-deny.js', 'server');

  api.export([
    'Migrations',
  ]);
});
