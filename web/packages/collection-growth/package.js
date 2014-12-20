Package.describe({
  name: 'collection-growth',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.use('base');
  api.use('collection-users');
  api.use('cities');
  
  api.addFiles('growthGithub/collection.jsdoc');
  api.addFiles('growthGithub/schema.js');
  api.addFiles('growthGithub/allow-deny.js');
  api.addFiles('growthGithub/publish.js', 'server');
  
  api.export([
    'GrowthGithub',
  ]);
});
