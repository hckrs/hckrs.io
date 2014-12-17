Package.describe({
  name: 'ext-match',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('check');
  api.addFiles('match.js');
});