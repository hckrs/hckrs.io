Package.describe({
  name: 'util-base',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0',
});

Package.onUse(function(api) {
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('momentjs:moment');

  api.addFiles('util-base/base.js');
  api.addFiles('util-base/underscore.js');
  api.addFiles('util-base/string.js');
  api.addFiles('util-base/number.js');
  api.addFiles('util-base/time.js');
  api.addFiles('util-base/meteor.js');
  api.addFiles('util-base/geo.js');

  api.export([
    'Util',
    'log',
    'debug',
  ]);
});