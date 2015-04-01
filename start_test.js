var spawn = require('child_process').spawn;

var workingDir = process.env.WORKING_DIR || process.env.PACKAGE_DIR || './';
var args = ['-p', 10015];


if (typeof process.env.METEOR_RELEASE !== 'undefined' &&
    process.env.METEOR_RELEASE !== '') {
    args.push('--release');
    args.push(process.env.METEOR_RELEASE);
}


if (typeof process.env.PACKAGES === 'undefined') {
  args.push('./');
}
else if (process.env.PACKAGES !== '') {
  args = args.concat(process.env.PACKAGES.split(';'));
}

var meteor = spawn((process.env.TEST_COMMAND || 'meteor'), args, {cwd: workingDir});
meteor.stdout.pipe(process.stdout);
meteor.stderr.pipe(process.stderr);
meteor.on('close', function (code) {
  console.log('meteor exited with code ' + code);
  process.exit(code);
});

meteor.stdout.on('data', function startTesting(data) {
  var data = data.toString();
  if(data.match(/10015|test-in-console listening/)) {
    console.log('starting testing...');
    meteor.stdout.removeListener('data', startTesting);
  }
});
