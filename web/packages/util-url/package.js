Package.describe({
  name: 'util-url',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
  git: ' /* Fill me in! */ '
});

Package.onUse(function(api) {
  api.use('base');
  
  api.addFiles('url.js');
  
  api.export('Url');
});