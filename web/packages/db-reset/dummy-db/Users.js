(function() {

var globalId = 0;
var surnames = ["Sanford","Hartman","Mckee","Cunningham","Peters","Frye","Gamble","Carpenter","Mcconnell","Johnson","Murphy","Mason","Durham","Ramos","Barr","Little","Day","Phillips","Bird","Bray","Roman","Pitts","Sanders","Osborne","Terrell","Guy","Horton","Singleton","Wright","French","Daugherty","Lester","Mullen","Gill","Pope","Clements","Black","Barry","Thornton","Russo","Kerr","Camacho","Michael","Howe","Terry","Mcclain","Blair","Sosa","Wade","Neal","Cabrera","Clemons","Briggs","Rowland","Aguilar","Hopper","Wilkerson","Vincent","Leblanc","Chaney","Evans","Silva","Macdonald","Cannon","Hill","Le","Cotton","Romero","Whitfield","Best","Figueroa","Hampton","Weber","Cantu","Stafford","Savage","Galloway","Knight","Duran","Baker","Hickman","Bradshaw","Santos","Schwartz","Jefferson","Pennington","Watts","Valdez","Logan","Carrillo","Strong","Solis","Buckley","Cook","Holman","Guerra","Dickson","Reyes","Patterson","Franklin"];
var firstnames = ["Jolene","Mathis","Gilliam","Monica","Ware","Caroline","Margaret","Sears","Nadia","Poole","Morin","Desiree","Kelli","Johanna","Roslyn","Gentry","Terry","Jerry","Kerry","Marjorie","Karyn","Willa","Julie","Lilian","Lara","Tammy","Durham","Mari","Hawkins","Vinson","Adela","Christy","Thelma","Jennie","Genevieve","Stokes","Mcgee","Greer","Williamson","Sharon","Mejia","Reyna","Leona","Lou","Hester","Sosa","Osborne","Wilkins","Marcy","Dixie","Schwartz","Carr","Medina","Gale","Beulah","Estela","Thornton","Glenna","Francisca","Dotson","Sandoval","Hart","Martinez","Mcleod","Byers","Josefina","Hays","Beard","Ruiz","Hester","Brooke","Betsy","Benjamin","Candy","Harding","Amie","Conrad","Natasha","Dudley","Jami","Joyner","Stanley","Loraine","Hopper","Reilly","Mcintosh","Campbell","Lewis","Solomon","Marion","Madeline","Deborah","Eddie","Barron","Rita","Clarice","Ilene","Compton","Morton","Martina"];
var domainZone = [".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us",".info",".net",".co.uk",".name",".io",".org",".tv",".biz",".me",".ca",".com",".us"];
var companies = ["Zolavo","Atgen","Imageflow","Jumpstack","Endipin","Confrenzy","Comtract","Malathion","Digigen","Fossiel","Gynko","Zaphire","Qimonk","Isostream","Firewax","Acumentor","Bitrex","Quadeebo","Multron","Otherway","Sultrax","Comfirm","Helixo","Solgan","Aquacine","Remotion","Printspan","Capscreen","Automon","Signity","Handshake","Voratak","Visualix","Inquala","Pawnagra","Brainquil","Eclipto","Evidends","Medicroix","Lingoage","Motovate","Snorus","Quarex","Aquasseur","Eplosion","Sensate","Apextri","Tsunamia","Skyplex","Paragonia","Applidec","Sarasonic","Assurity","Kongle","Centree","Kiosk","Liquicom","Isbol","Opticom","Netropic","Xanide","Genmy","Orbaxter","Sportan","Assitia","Uni","Xiix","Zilencio","Sybixtex","Nspire","Geostele","Prismatic","Nikuda","Stockpost","Pulze","Eyeris","Cinesanct","Netbook","Prosely","Kaggle","Fanfare","Rooforia","Parcoe","Balooba","Halap","Interodeo","Synkgen","Lexicondo","Providco","Zedalis","Bulljuice","Essensia","Imperium","Filodyne","Zidox","Retrack","Exposa","Terrasys","Fiberox","Portica"];
var urls = ["https://is.gd/dolor/sit.png","http://netscape.com/ligula.xml","http://paginegialle.it/ut.json","http://sbwire.com/tortor/quis/turpis/sed.html","http://simplemachines.org/at/velit/vivamus.xml","http://ca.gov/ut/rhoncus.png","http://quantcast.com/lacinia/erat/vestibulum/sed.aspx","https://google.co.jp/placerat/praesent/blandit/nam/nulla/integer/pede.xml","http://telegraph.co.uk/morbi/vestibulum/velit/id.xml","http://bloglovin.com/duis/aliquam/convallis/nunc/proin/at/turpis.json","http://ed.gov/euismod/scelerisque.png","https://mapy.cz/praesent/blandit/nam/nulla.png","http://loc.gov/posuere/cubilia/curae/donec/pharetra/magna/vestibulum.jpg","http://biblegateway.com/mattis/pulvinar/nulla/pede/ullamcorper/augue/a.png","http://tumblr.com/scelerisque/quam/turpis/adipiscing.html","http://mtv.com/et/ultrices/posuere/cubilia/curae/duis/faucibus.jpg","http://wunderground.com/augue/vestibulum.aspx","http://fema.gov/proin/at/turpis/a/pede/posuere/nonummy.aspx","https://bloglovin.com/est/phasellus/sit/amet/erat.xml","http://globo.com/enim/sit/amet/nunc/viverra/dapibus.xml","https://google.com.au/sapien/non/mi/integer/ac/neque.html","https://wufoo.com/nullam/orci/pede/venenatis.png","https://google.ru/erat.png","https://engadget.com/convallis/duis.json","http://icio.us/rhoncus.aspx","https://ow.ly/enim/in/tempor.aspx","https://google.com.hk/quam/sapien.jsp","http://blogger.com/ut/tellus/nulla/ut.jpg","https://hud.gov/quisque/porta/volutpat/erat/quisque.html","http://hatena.ne.jp/eleifend/donec/ut/dolor.jsp","https://booking.com/faucibus/cursus/urna/ut/tellus/nulla/ut.js","https://ed.gov/etiam/vel/augue/vestibulum/rutrum/rutrum/neque.json","https://home.pl/turpis/a/pede/posuere/nonummy/integer/non.html","http://discovery.com/id/turpis/integer.png","http://oaic.gov.au/tempus/semper/est/quam/pharetra/magna/ac.js","http://geocities.com/libero/convallis.xml","http://bigcartel.com/vel/sem.png","https://uiuc.edu/nulla/eget/eros/elementum/pellentesque.xml","https://mayoclinic.com/ipsum/dolor/sit/amet/consectetuer.html","http://netscape.com/quis/turpis/eget/elit/sodales/scelerisque/mauris.png","http://tamu.edu/magnis/dis/parturient/montes/nascetur/ridiculus.js","https://toplist.cz/quis/justo/maecenas/rhoncus.jsp","https://networkadvertising.org/in/consequat/ut/nulla/sed/accumsan/felis.js","http://cnbc.com/ut/dolor/morbi/vel/lectus/in/quam.xml","http://themeforest.net/porta/volutpat/erat/quisque/erat.aspx","https://studiopress.com/orci/vehicula/condimentum/curabitur.xml","https://hibu.com/vestibulum/sagittis/sapien/cum/sociis/natoque.jsp","https://amazon.co.jp/praesent/lectus.json","http://blog.com/etiam/faucibus/cursus/urna.png","https://earthlink.net/quis/libero/nullam/sit.jsp","http://merriam-webster.com/dolor/sit/amet/consectetuer/adipiscing/elit/proin.js","https://geocities.jp/phasellus.png","https://amazon.com/semper/rutrum.html","https://shutterfly.com/non/lectus/aliquam.jpg","https://bbc.co.uk/eu/sapien.jpg","http://google.ru/fermentum/donec/ut/mauris/eget/massa.jpg","https://livejournal.com/nulla.jsp","https://issuu.com/tincidunt/eget/tempus/vel/pede/morbi/porttitor.jpg","https://newsvine.com/porta/volutpat/erat/quisque/erat/eros.jsp","http://zimbio.com/ut/tellus/nulla/ut/erat/id/mauris.png","http://nyu.edu/pede.jsp","http://shutterfly.com/id/ornare/imperdiet/sapien/urna/pretium/nisl.aspx","https://slashdot.org/id/nisl/venenatis/lacinia.jpg","http://hud.gov/justo/in/blandit/ultrices/enim/lorem/ipsum.js","http://fema.gov/nunc.jsp","http://elegantthemes.com/erat/curabitur.js","http://google.ca/non/ligula/pellentesque/ultrices.jsp","http://artisteer.com/nulla/neque/libero/convallis/eget.jsp","http://google.co.jp/nullam/molestie/nibh.xml","http://ibm.com/malesuada/in/imperdiet.js","http://wsj.com/lorem/integer.html","https://phpbb.com/congue/eget/semper/rutrum/nulla/nunc.json","https://omniture.com/vivamus/in.xml","https://feedburner.com/justo/etiam/pretium.png","https://nifty.com/vel/accumsan/tellus/nisi/eu/orci.html","https://joomla.org/tempus/vivamus.aspx","https://cmu.edu/congue/etiam/justo/etiam/pretium/iaculis/justo.jpg","https://rediff.com/vel/pede/morbi/porttitor/lorem.json","http://jimdo.com/faucibus/cursus/urna/ut/tellus/nulla.aspx","https://harvard.edu/eget/tempus/vel/pede/morbi.html","http://berkeley.edu/amet/erat/nulla/tempus/vivamus/in.aspx","http://npr.org/tempus/vivamus/in/felis/eu.json","http://behance.net/mauris/laoreet.jsp","http://live.com/consectetuer/eget/rutrum/at/lorem/integer.js","https://jiathis.com/non/lectus/aliquam/sit.html","http://shareasale.com/amet.html","https://miitbeian.gov.cn/euismod/scelerisque/quam/turpis/adipiscing/lorem.js","https://about.com/luctus/et/ultrices/posuere/cubilia/curae/duis.js","https://creativecommons.org/ridiculus/mus/vivamus/vestibulum/sagittis/sapien.html","http://cpanel.net/vehicula/consequat/morbi/a.jpg","https://goo.gl/vel/pede/morbi.json","https://facebook.com/sit/amet/nunc.aspx","http://hexun.com/sagittis/dui.html","https://elegantthemes.com/velit/vivamus/vel.jpg","http://pcworld.com/non/lectus/aliquam/sit.jpg","http://prweb.com/justo/in/blandit/ultrices.js","https://loc.gov/magna/vestibulum/aliquet/ultrices.json","https://wikispaces.com/pede/ullamcorper.json","http://huffingtonpost.com/sodales/sed/tincidunt/eu/felis.json","http://bbb.org/convallis/duis/consequat/dui/nec/nisi.png"];

// Gather real user pictures
var socialPictures, socialUrls;
try {
  var githubUsers = 'https://api.github.com/search/users?q=location:lyon';
  var options = {
    headers: {"User-Agent": "Meteor/"+Meteor.release},
    params: {
      client_id: Settings['github']['clientId'],
      client_secret: Settings['github']['secret'],
    }
  };
  var items = HTTP.get(githubUsers, options).data.items;
  socialPictures = _.pluck(items, "avatar_url");
  socialUrls = _.pluck(items, "html_url");
} catch(e) {
  socialPictures = ["http://placehold.it/180x180"];
  socialUrls = ['https://github.com/Jarnoleconte'];
} 



var users = _.flatten(
  _.map(CITYKEYS, function(city) { 
    console.log("Add users for", city)

    // generate 15 users per city
    var count = 15; //8 + Math.floor(Random.fraction() * (Random.fraction() < 0.05 ? 60 : 5))
    return _.map(_.range(count), function() { 

      var firstname = Random.choice(firstnames);
      var surname = Random.choice(surnames);
      var digit = Math.floor(Random.fraction() * 999);
      var email = firstname + "." + surname + digit + "@" + Random.choice(companies) + Random.choice(domainZone);

      var i = Math.floor(Random.fraction() * socialPictures.length);
      var socialPicture = socialPictures[i];
      var socialUrl = socialUrls[i];

      var isDisabled = Random.fraction() < 0.1;
      var isAmbassador = Random.fraction() < 0.1;
      var isAdmin = Random.fraction() < 0.1;

      return {
        accessAt: new Date("2014-11-21T12:29:02.007Z"),
        city: city,
        currentCity: city,
        createdAt: new Date("2014-11-21T12:27:01.584Z"),
        emails: [
          {
            address: email,
            verified: true
          }
        ],
        globalId: ++globalId,
        invitationPhrase: globalId * 2 + 77,
        invitations: Random.choice(_.range(10)),
        mailings: [
          "local_meetup_announcements",
          "local_ambassador_messages",
          "event_announcements",
          "global_new_features"
        ],
        profile: {
          available: Random.subarray(AVAILABLE_VALUES),
          company: Random.choice(companies),
          companyUrl: Random.choice(urls),
          email: email,
          favoriteSkills: [],
          hacking: Random.subarray(HACKING_VALUES),
          homepage: Random.choice(urls),
          location: {
            lat: CITYMAP[city].latitude + (Random.fraction() * 0.10 - 0.05),
            lng: CITYMAP[city].longitude + (Random.fraction() * 0.10 - 0.05)
          },
          name: firstname + " " + surname,
          picture: socialPicture,
          skills: Random.subarray(SKILL_NAMES),
          social: {
            github: socialUrl
          },
          socialPicture: {
            github: socialPicture
          }
        },
        "isAccessDenied" : isDisabled,
        "isAdmin" : isAdmin,
        "isAmbassador" : isAmbassador,
        "isHidden" : isDisabled,
        "isIncompleteProfile" : isDisabled && Math.round(Random.fraction()),
        "isUninvited" : isDisabled && Math.round(Random.fraction()),
      }

    });
  })
);

return users;
})()