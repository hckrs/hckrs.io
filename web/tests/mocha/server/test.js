Velocity.startup(function () {
  MochaWeb.testOnly(function() {
      describe('Client: Initialization', function() {
          it('Runs', function() {
              chai.assert.equal(true, true, 'true equals true');
          });
      });
  });
});
