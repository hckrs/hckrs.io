Package.describe({
  name: 'db-migrations',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('peerlibrary:async', 'server');

  api.use('base');
  api.use('collection-migrations');

  api.addFiles('migrations/migrations.js', 'server');
  api.addFiles('migrations/run.js', 'server');
});
