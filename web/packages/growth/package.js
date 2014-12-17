Package.describe({
  name: 'growth',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('peerlibrary:async');

  api.use('base');
  api.use('collection-users');
  api.use('collection-growth');
  api.use('collection-email-templates');
  api.use('collection-emails-outbound');
  api.use('cities');
  api.use('util-url');
  api.use('email-templates');

  api.addFiles('growth/growth.js', 'server');
  api.addFiles('growth/crawler-server.js', 'server');
  api.addFiles('growth/crawler-client.js', 'client');
});
