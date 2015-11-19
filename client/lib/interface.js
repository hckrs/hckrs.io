Interface = {

  setHeaderStyle: function(style) {
    Session.set('headerStyle', style); 
  },
  getHeaderStyle: function() {
    return Session.get('headerStyle'); 
  }

}

