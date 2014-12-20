Package.describe({
  name: 'collection-invitations',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('invitations/collection.jsdoc');
  api.addFiles('invitations/schema.js');
  api.addFiles('invitations/allow-deny.js');
  api.addFiles('invitations/publish.js', 'server');
  
  api.export([
    'Invitations',
  ]);
});
