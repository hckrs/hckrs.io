Package.describe({
  name: 'ext-underscore',
  summary: ' /* Fill me in! */ ',
  version: '1.0.0'
});

Package.onUse(function(api) {
  api.use('hckrs:docs');
  
  api.versionsFrom('1.0');
  api.use('underscore');
  api.use('mrt:underscore-inflection', {unordered: true});

  api.addFiles('mixins/deep.js');
  api.addFiles('mixins/deepExtend.js');
  api.addFiles('mixins/deepPick.js');
  api.addFiles('mixins/deepPluck.js');
  api.addFiles('mixins/func.js');
  api.addFiles('mixins/pickRename.js');
  api.addFiles('mixins/property.js');

  api.imply('underscore');
});
