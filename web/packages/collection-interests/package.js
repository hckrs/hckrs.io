Package.describe({
  name: 'collection-interests',
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
  
  api.addFiles('interests/collection.jsdoc');
  api.addFiles('interests/schema.js');
  api.addFiles('interests/allow-deny.js');
  api.addFiles('interests/publish.js', 'server');
  
  api.imply('collection-base');  
  api.export('InterestCollection');
});