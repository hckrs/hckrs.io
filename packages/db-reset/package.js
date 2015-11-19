Package.describe({
  name: 'db-reset',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('cities');
  api.use('collection-users');

  api.addFiles('reset.js', 'server');
  
  api.addFiles('dummy-db/Deals.js', 'server', {isAsset: true});
  api.addFiles('dummy-db/Highlights.js', 'server', {isAsset: true});
  api.addFiles('dummy-db/Places.js', 'server', {isAsset: true});
  api.addFiles('dummy-db/Users.js', 'server', {isAsset: true});
});