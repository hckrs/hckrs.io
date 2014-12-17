Package.describe({
  name: 'collection-growth',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('growthGithub/schema.js');
  api.addFiles('growthGithub/allow-deny.js');
  api.addFiles('growthGithub/publish.js', 'server');
  
  api.export([
    'GrowthGithub',
  ]);
});
