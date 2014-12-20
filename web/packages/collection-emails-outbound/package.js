Package.describe({
  name: 'collection-emails-outbound',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('collection-users');
  api.use('cities');
  
  api.addFiles('emails-outbound/collection.jsdoc');
  api.addFiles('emails-outbound/schema.js');
  api.addFiles('emails-outbound/allow-deny.js');
  api.addFiles('emails-outbound/publish.js', 'server');
  
  api.export([
    'EmailsOutbound',
  ]);
});
