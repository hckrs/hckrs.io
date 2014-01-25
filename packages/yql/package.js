Package.describe({
  summary: 'Package wrapper for node-yql.'
});

Package.on_use(function (api) {

  Npm.depends({
    "yql": '0.4.8'
  });
  api.add_files('startup.js', 'server');
  api.export('YQL', 'server');
});

