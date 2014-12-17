Package.describe({
  name: 'collection-deals',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('base');
  api.use('collection-users');
  
  api.addFiles('deals/schema.js');
  api.addFiles('deals/allow-deny.js');
  api.addFiles('deals/publish.js', 'server');
  api.addFiles('deals/methods.js', 'server');
  
  api.export([
    'Deals',
    'DealsSort',
  ]);
});
