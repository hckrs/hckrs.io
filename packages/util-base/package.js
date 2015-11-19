Package.describe({
  name: 'util-base',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');

  api.imply('util-base-array');
  api.imply('util-base-number');
  api.imply('util-base-object');
  api.imply('util-base-query');
  api.imply('util-base-string');
  api.imply('util-base-time');
});