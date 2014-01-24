Package.describe({
  summary: 'Package wrapper for node-request.'
});

Package.on_use(function (api) {

  Npm.depends({
    "request": '2.33.0'
  });
  api.add_files('startup.js', 'server');
  api.export('request', 'server');
});

