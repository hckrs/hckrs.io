// Route Controller

AgendaController = DefaultController.extend({
  template: 'agenda',
  waitOn: function () {
    return [];
  }
});


Template.agenda.helpers({
  iframe: function() {
    // we feed the iframe as whole into the template
    // because Google will not be load correctly when we have
    // an reactive data source as src attribute for that frame
    var agenda = (CITYMAP[Session.get('currentCity')] || {}).agenda
    return '<iframe id="agenda2" src="'+agenda+'" style=" border-width:0 " width="100%" height="700" frameborder="0" scrolling="no"></iframe>';
  }
})