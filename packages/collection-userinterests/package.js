Package.describe({
  name: 'collection-userinterests',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('collection-base');
  api.use('cities');
  api.use('util-url');
  api.use('util-base');
  api.use('util');
  api.use('account', {unordered: true});
  
  api.addFiles('userinterests/collection.jsdoc');
  api.addFiles('userinterests/schema.js');
  api.addFiles('userinterests/allow-deny.js');
  api.addFiles('userinterests/hooks.js');
  api.addFiles('userinterests/publish.js', 'server');
  
  api.imply('collection-base');  
  api.export('UserInterests');
});
