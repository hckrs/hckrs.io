var cities = [
  {
      key: "aachen",
      name: "Aachen",
      country: "DE",
      latitude: 50.7762954,
      longitude: 6.0838209,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "aalborg",
      name: "Aalborg",
      country: "DK",
      latitude: 57.0482206,
      longitude: 9.9193939,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "aarhus",
      name: "Aarhus",
      country: "DK",
      latitude: 56.1496278,
      longitude: 10.2134046,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "marseille",
      name: "Marseille",
      country: "FR",
      latitude: 43.2961743,
      longitude: 5.3699525,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_c8nkqt9jl62frv2mbt2nhvpncc@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "amsterdam",
      name: "Amsterdam",
      country: "NL",
      latitude: 52.3710088,
      longitude: 4.9001115,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_c883teav21l3t6nvh3sp083dqo@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "athens",
      name: "Athens",
      country: "IT",
      latitude: 33.9595974,
      longitude: -83.376678,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "barcelona",
      name: "Barcelona",
      country: "ES",
      latitude: 41.3870186,
      longitude: 2.1700437,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "minsk", /* orignal : belarus */ 
      name: "Minsk",
      country: "BY",
      latitude: 53.9,
      longitude: 27.566667,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "belfast",
      name: "Belfast",
      country: "GB",
      latitude: 54.5969467,
      longitude: -5.9301554,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "belgrade",
      name: "Belgrade",
      country: "RS",
      latitude: 44.8178787,
      longitude: 20.4568089,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "bergen",
      name: "Bergen",
      country: "NO",
      latitude: 60.3568769,
      longitude: 5.37306653035156,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "berlin",
      name: "Berlin",
      country: "DE",
      latitude: 52.5170365,
      longitude: 13.3888599,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  { /* added becose it's a capital */
      key:  "bern",
      name: "Bern",
      country: "CH",
      latitude: 46.947922,
      longitude: 7.444608,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "birmingham",
      name: "Birmingham",
      country: "GB",
      latitude: 52.4813679,
      longitude: -1.8980726,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "sarajevo",  // original bosnia and herzegovina
      name: "Sarajevo",
      country: "BA",
      latitude: 43.856259,
      longitude: 18.413076,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "bratislava",
      name: "Bratislava",
      country: "SK",
      latitude: 48.1535383,
      longitude: 17.1096711,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "brussels",
      name: "Brussels",
      country: "BE",
      latitude: 50.84340935,
      longitude: 4.36748762309029,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "bucharest",
      name: "Bucharest",
      country: "RO",
      latitude: 44.436139,
      longitude: 26.1027436,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "cambridge",
      name: "Cambridge",
      country: "GB",
      latitude: 52.2033051,
      longitude: 0.124862,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "cardiff",
      name: "Cardiff",
      country: "GB",
      latitude: 51.4835299,
      longitude: -3.1836873,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "chisinau",
      name: "Chisinau", /* added because it is a capital */
      country: "MD",
      latitude: 60.098717,
      longitude: 24.313764,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "cluj-napoca", // original cluj-napoca
      name: "Cluj-Napoca",
      country: "RO",
      latitude: 46.7693367,
      longitude: 23.5900604,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "cologne",
      name: "Cologne",
      country: "DE",
      latitude: 50.9374863,
      longitude: 6.9580232,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "copenhagen",
      name: "Copenhagen",
      country: "DK",
      latitude: 55.6867243,
      longitude: 12.5700724,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "cork",
      name: "Cork",
      country: "IE",
      latitude: 51.8979282,
      longitude: -8.4705806,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "zagreb", /* original coatia */
      name: "Zagreb",
      country: "HR",
      latitude: 45.815011,
      longitude: 15.981919,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "nicosia", /* original Cyprus*/
      name: "Nicosia",
      country: "CY",
      latitude: 35.166667,
      longitude: 33.366667,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "prague",
      name: "Prague",
      country: "CZ",
      latitude: 50.075538,
      longitude: 14.4378,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },/*
  {
      key:  "republic",
      name: "Republic",
      country: "",
      latitude: 39.8266503,
      longitude: -97.6580834,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  {
      key:  "delft",
      name: "Delft",
      country: "NL",
      latitude: 52.0114017,
      longitude: 4.35839,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_dee3lgnb6lla5dm35il4ku99f8@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "dublin",
      name: "Dublin",
      country: "IE",
      latitude: 53.3494299,
      longitude: -6.2600969,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "dusseldorf",
      name: "Düsseldorf",
      country: "DE",
      latitude: 51.2235376,
      longitude: 6.7637565,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "eindhoven",
      name: "Eindhoven",
      country: "NL",
      latitude: 51.4485627,
      longitude: 5.45012171525492,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_erifj40gbgfk4imstavstqtblo@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "tallinn", /* original Estonia */
      name: "Tallinn",
      country: "EE",
      latitude: 59.436961,
      longitude: 24.753575,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "frankfurt",
      name: "Frankfurt",  // original "Frankfurt Rhein-Main"
      country: "DE",
      latitude: 49.9482506,
      longitude: 7.2665608,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },/*
  {
      key:  "galicia",
      name: "Galicia",
      country: "",
      latitude: 42.61946,
      longitude: -7.863112,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  {
      key:  "galway",
      name: "Galway",
      country: "IE",
      latitude: 53.2839934,
      longitude: -9.03834040962519,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "gdansk",
      name: "Gdansk",
      country: "PL",
      latitude: 54.3482259,
      longitude: 18.6542888,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },/* small citys near Gdansk
  {
      key:  "Sopot",
      name: "Sopot",
      country: "",
      latitude: 54.4446674,
      longitude: 18.5685868,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "gdynia",
      name: "Gdynia",
      country: "",
      latitude: 54.5164982,
      longitude: 18.5402738,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  {
      key:  "geneva",
      name: "Geneva",
      country: "CH",
      latitude: 46.2017559,
      longitude: 6.1466014,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "gent",
      name: "Gent",
      country: "BE",
      latitude: 51.0558119,
      longitude: 3.7239194,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "antwerpen",
      name: "Antwerpen",
      country: "BE",
      latitude: 51.2212016,
      longitude: 4.3996325,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "leuven",
      name: "Leuven",
      country: "BE",
      latitude: 50.8790369,
      longitude: 4.7014992,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "ljubljana",
      name: "Ljubljana",
      country: "SI",
      latitude: 46.056947,
      longitude: 14.505751,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "gothenburg",
      name: "Gothenburg",
      country: "SE",
      latitude: 57.7072326,
      longitude: 11.9670171,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "granada",
      name: "Granada",
      country: "ES",
      latitude: 37.1830197,
      longitude: -3.602192,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "grenoble",
      name: "Grenoble",
      country: "FR",
      latitude: 45.182478,
      longitude: 5.7210773,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_dlg5tkvdf2mqg683mq8etl197s@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "groningen",
      name: "Groningen",
      country: "NL",
      latitude: 53.2073097,
      longitude: 6.7185795611494,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_2u5g03cga2mtiidki4qk946878@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "mons", /* orijginal : region of Hainaut */
      name: "Mons",
      country: "BE",
      latitude: 50.454241,
      longitude: 3.956659,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "hamburg",
      name: "Hamburg",
      country: "DE",
      latitude: 53.5503414,
      longitude: 10.000654,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "hannover",
      name: "Hannover",
      country: "DE",
      latitude: 52.3744779,
      longitude: 9.7385532,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "helsinki",
      name: "Helsinki",
      country: "FI",
      latitude: 60.1713198,
      longitude: 24.9414566,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "budapest",
      name: "Budapest", /* original : country hungary */
      country: "HU",
      latitude: 47.497912,
      longitude: 19.040235,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "reykjavik",
      name: "Reykjavík", /* orignal : country iceland */
      country: "IS",
      latitude: 64.133333,
      longitude: -21.933333,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "rome",
      name: "Rome", /* original : country italy */
      country: "IT",
      latitude: 41.872389,
      longitude: 12.48018,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "kiev",
      name: "Kiev", /* added because it is a capital */
      country: "UA",
      latitude: 50.4501,
      longitude: 30.5234,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "krakow", /* good in englsih*/
      name: "Kraków",
      country: "PL",
      latitude: 50.061892,
      longitude: 19.9368564,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "kyiv",
      name: "Kyiv",
      country: "UA",
      latitude: 50.4499875,
      longitude: 30.5234937,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "riga", /* original : country of latvia */
      name: "Rīga",
      country: "LV",
      latitude: 56.949649,
      longitude: 24.105186,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "leipzig",
      name: "Leipzig",
      country: "DE",
      latitude: 51.340462,
      longitude: 12.3747049,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "liege",
      name: "Liège",
      country: "BE",
      latitude: 50.645138,
      longitude: 5.5734204,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "lille",
      name: "Lille",
      country: "FR",
      latitude: 50.6305089,
      longitude: 3.0706414,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_nbsk0f97uhck487jcnup069jks@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "limerick",
      name: "Limerick",
      country: "IE",
      latitude: 52.6612577,
      longitude: -8.6302084,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "vilnius", /* orginal : country of lithuania */
      name: "Vilnius",
      country: "LT",
      latitude: 54.687156,
      longitude: 25.279651,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "liverpool",
      name: "Liverpool",
      country: "GB",
      latitude: 53.4054719,
      longitude: -2.9805393,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "london",
      name: "London",
      country: "GB",
      latitude: 51.5072759,
      longitude: -0.1276597,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "luxembourg",
      name: "Luxembourg", /* Luxembourg is the capital of Luxembourg ! */
      country: "LU",
      latitude: 49.815273,
      longitude: 6.129583,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "lyon",
      name: "Lyon",
      country: "FR",
      latitude: 45.7575958,
      longitude: 4.8323239,
      backgroundImage: "/img/backgrounds/lyon.jpg",
      backgroundImageNight: "/img/backgrounds/lyon_night.jpg",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_ppb66g6vmhs15imf1grhja6has@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "https://a.tiles.mapbox.com/v3/ramshorst.gcoejeom/attribution.html#13/45.7697/4.8552",
      twitter: "hckrsLyon"
  },
  {
      key:  "maastricht",
      name: "Maastricht",
      country: "NL",
      latitude: 50.85790405,
      longitude: 5.69681910047491,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_2vf092o7u7rpcd17de67tkkrog@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "skopje", /* original : country of macedonia */
      name: "Skopje",
      country: "MK",
      latitude: 41.997346,
      longitude: 21.427996,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "madrid",
      name: "Madrid",
      country: "ES",
      latitude: 40.52516075,
      longitude: -3.77181653956588,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "manchester",
      name: "Manchester",
      country: "GB",
      latitude: 53.4791466,
      longitude: -2.2447445,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "montpellier",
      name: "Montpellier",
      country: "FR",
      latitude: 43.6112422,
      longitude: 3.8767337,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_t7ocnuqk4ulda2gns55ohohqcc@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "moscow",
      name: "Moscow",
      country: "RU",
      latitude: 55.755826,
      longitude: 37.6173,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "munich",
      name: "Munich",
      country: "DE",
      latitude: 48.1372719,
      longitude: 11.5754815,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "nurnberg",
      name: "Nürnberg",
      country: "DE",
      latitude: 49.4538723,
      longitude: 11.0772978,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "oslo",
      name: "Oslo",
      country: "NO",
      latitude: 59.9132694,
      longitude: 10.7391112,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "oxford",
      name: "Oxford",
      country: "GB",
      latitude: 51.7521553,
      longitude: -1.2582135,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "paris",
      name: "Paris",
      country: "FR",
      latitude: 48.8565056,
      longitude: 2.3521334,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_t0eq4ek53a3lfp014ekj3308ao@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "podgorica",
      name: "Podgorica",
      country: "ME",
      latitude: 42.466667,
      longitude: 19.266667,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },/* university near paris
  {
      key:  "saclay",
      name: "Saclay",
      country: "",
      latitude: 48.7305162,
      longitude: 2.172576,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  /* very small city
  {
      key:  "passau",
      name: "Passau",
      country: "",
      latitude: 48.5740136,
      longitude: 13.4606445,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*//* small city in germany
  {
      key:  "pomerania",
      name: "Pomerania",
      country: "",
      latitude: 54.143148,
      longitude: 17.9057338,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  {
      key:  "lisbon", /* original : country portugal */
      name: "Lisbon",
      country: "PT",
      latitude: 38.722252,
      longitude: -9.139337,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "poznan",
      name: "Poznań", /* no english name found */
      country: "PL",
      latitude: 52.4082296,
      longitude: 16.9333644,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "rotterdam",
      name: "Rotterdam",
      country: "NL",
      latitude: 51.9228958,
      longitude: 4.4631727,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_un321a3u8cj30r3ku9a6fs2fik@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "glasgow", /* original : country scotland */
      name: "Glasgow",
      country: "GB",
      latitude: 55.864237,
      longitude: -4.251806,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "sheffield",
      name: "Sheffield",
      country: "GB",
      latitude: 53.3806626,
      longitude: -1.4702278,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "sofia",
      name: "Sofia",
      country: "BG",
      latitude: 42.6977149,
      longitude: 23.3230598,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "stavanger",
      name: "Stavanger",
      country: "NO",
      latitude: 58.9680427,
      longitude: 5.7324722,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "stockholm",
      name: "Stockholm",
      country: "SE",
      latitude: 59.3251172,
      longitude: 18.0710935,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "stuttgart",
      name: "Stuttgart",
      country: "DE",
      latitude: 48.7763511,
      longitude: 9.1829049,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "swansea",
      name: "Swansea",
      country: "GB",
      latitude: 51.6546228,
      longitude: -4.00272971491907,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },/* no tech scene
  {
      key:  "tenerife",
      name: "Tenerife",
      country: "",
      latitude: 28.2935724,
      longitude: -16.6218483519602,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },*/
  {
      key:  "toulouse",
      name: "Toulouse",
      country: "FR",
      latitude: 43.6044622,
      longitude: 1.4442469,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "https://www.google.com/calendar/embed?showTitle=0&amp;showNav=1&amp;showDate=0&amp;showPrint=0&amp;showTabs=0&amp;showCalendars=0&amp;showTz=0&amp;height=600&amp;wkst=2&amp;hl=en_GB&amp;bgcolor=%23CCCCCC&amp;src=startupdigest.com_eq56vovhn61b9gug9k83u7fkpo@group.calendar.google.com&amp;color=%238D6F47&amp;ctz=Europe%2FParis",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "tirana",
      name: "Tirana",
      country: "AL",
      latitude: 41.327546,
      longitude: 19.818698,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "varna",
      name: "Varna",
      country: "BG",
      latitude: 43.2166104,
      longitude: 27.9017131,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "vienna",
      name: "Vienna",
      country: "AT",
      latitude: 48.2083537,
      longitude: 16.3725042,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "warsaw",
      name: "Warsaw",
      country: "PL",
      latitude: 52.2319237,
      longitude: 21.0067265,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "wroclaw", // original wrocław
      name: "Wrocław",
      country: "PL",
      latitude: 51.1122376,
      longitude: 17.0344333,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "zurich",
      name: "Zurich",
      country: "CH",
      latitude: 47.3685586,
      longitude: 8.5404434,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
  {
      key:  "enschede",
      name: "Enschede",
      country: "NL",
      latitude: 52.2161111,
      longitude: 6.89841690469321,
      backgroundImage: "/img/backgrounds/enschede.jpg",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: "hckrsEnschede"
  },
  {
      key:  "utrecht",
      name: "Utrecht",
      country: "NL",
      latitude: 52.11849915,
      longitude: 5.15264611584469,
      backgroundImage: "",
      backgroundImageNight: "",
      agenda: "",
      mapbox: "",
      twitter: ""
  },
]

// map country codes to names
COUNTRYCODES = {
  "AF": "Afghanistan",
  "AX": "Åland Islands",
  "AL": "Albania",
  "DZ": "Algeria",
  "AS": "American Samoa",
  "AD": "Andorra",
  "AO": "Angola",
  "AI": "Anguilla",
  "AQ": "Antarctica",
  "AG": "Antigua and Barbuda",
  "AR": "Argentina",
  "AM": "Armenia",
  "AW": "Aruba",
  "AU": "Australia",
  "AT": "Austria",
  "AZ": "Azerbaijan",
  "BS": "Bahamas",
  "BH": "Bahrain",
  "BD": "Bangladesh",
  "BB": "Barbados",
  "BY": "Belarus",
  "BE": "Belgium",
  "BZ": "Belize",
  "BJ": "Benin",
  "BM": "Bermuda",
  "BT": "Bhutan",
  "BO": "Bolivia",
  "BQ": "Bonaire",
  "BA": "Bosnia and Herzegovina",
  "BW": "Botswana",
  "BV": "Bouvet Island",
  "BR": "Brazil",
  "IO": "British Indian Ocean Territory",
  "BN": "Brunei Darussalam",
  "BG": "Bulgaria",
  "BF": "Burkina Faso",
  "BI": "Burundi",
  "KH": "Cambodia",
  "CM": "Cameroon",
  "CA": "Canada",
  "CV": "Cape Verde",
  "KY": "Cayman Islands",
  "CF": "Central African Republic",
  "TD": "Chad",
  "CL": "Chile",
  "CN": "China",
  "CX": "Christmas Island",
  "CC": "Cocos (Keeling) Islands",
  "CO": "Colombia",
  "KM": "Comoros",
  "CG": "Congo",
  "CD": "Congo, the Democratic Republic of the",
  "CK": "Cook Islands",
  "CR": "Costa Rica",
  "CI": "Côte d'Ivoire",
  "HR": "Croatia",
  "CU": "Cuba",
  "CW": "Curaçao",
  "CY": "Cyprus",
  "CZ": "Czech Republic",
  "DK": "Denmark",
  "DJ": "Djibouti",
  "DM": "Dominica",
  "DO": "Dominican Republic",
  "EC": "Ecuador",
  "EG": "Egypt",
  "SV": "El Salvador",
  "GQ": "Equatorial Guinea",
  "ER": "Eritrea",
  "EE": "Estonia",
  "ET": "Ethiopia",
  "FK": "Falkland Islands (Malvinas)",
  "FO": "Faroe Islands",
  "FJ": "Fiji",
  "FI": "Finland",
  "FR": "France",
  "GF": "French Guiana",
  "PF": "French Polynesia",
  "TF": "French Southern Territories",
  "GA": "Gabon",
  "GM": "Gambia",
  "GE": "Georgia",
  "DE": "Germany",
  "GH": "Ghana",
  "GI": "Gibraltar",
  "GR": "Greece",
  "GL": "Greenland",
  "GD": "Grenada",
  "GP": "Guadeloupe",
  "GU": "Guam",
  "GT": "Guatemala",
  "GG": "Guernsey",
  "GN": "Guinea",
  "GW": "Guinea-Bissau",
  "GY": "Guyana",
  "HT": "Haiti",
  "HM": "Heard Island and McDonald Islands",
  "VA": "Holy See",
  "HN": "Honduras",
  "HK": "Hong Kong",
  "HU": "Hungary",
  "IS": "Iceland",
  "IN": "India",
  "ID": "Indonesia",
  "IR": "Iran",
  "IQ": "Iraq",
  "IE": "Ireland",
  "IM": "Isle of Man",
  "IL": "Israel",
  "IT": "Italy",
  "JM": "Jamaica",
  "JP": "Japan",
  "JE": "Jersey",
  "JO": "Jordan",
  "KZ": "Kazakhstan",
  "KE": "Kenya",
  "KI": "Kiribati",
  "KP": "Korea",
  "KR": "Korea",
  "KW": "Kuwait",
  "KG": "Kyrgyzstan",
  "LA": "Lao",
  "LV": "Latvia",
  "LB": "Lebanon",
  "LS": "Lesotho",
  "LR": "Liberia",
  "LY": "Libya",
  "LI": "Liechtenstein",
  "LT": "Lithuania",
  "LU": "Luxembourg",
  "MO": "Macao",
  "MK": "Macedonia",
  "MG": "Madagascar",
  "MW": "Malawi",
  "MY": "Malaysia",
  "MV": "Maldives",
  "ML": "Mali",
  "MT": "Malta",
  "MH": "Marshall Islands",
  "MQ": "Martinique",
  "MR": "Mauritania",
  "MU": "Mauritius",
  "YT": "Mayotte",
  "MX": "Mexico",
  "FM": "Micronesia",
  "MD": "Moldova",
  "MC": "Monaco",
  "MN": "Mongolia",
  "ME": "Montenegro",
  "MS": "Montserrat",
  "MA": "Morocco",
  "MZ": "Mozambique",
  "MM": "Myanmar",
  "NA": "Namibia",
  "NR": "Nauru",
  "NP": "Nepal",
  "NL": "Netherlands",
  "NC": "New Caledonia",
  "NZ": "New Zealand",
  "NI": "Nicaragua",
  "NE": "Niger",
  "NG": "Nigeria",
  "NU": "Niue",
  "NF": "Norfolk Island",
  "MP": "Northern Mariana Islands",
  "NO": "Norway",
  "OM": "Oman",
  "PK": "Pakistan",
  "PW": "Palau",
  "PS": "Palestinian Territory",
  "PA": "Panama",
  "PG": "Papua New Guinea",
  "PY": "Paraguay",
  "PE": "Peru",
  "PH": "Philippines",
  "PN": "Pitcairn",
  "PL": "Poland",
  "PT": "Portugal",
  "PR": "Puerto Rico",
  "QA": "Qatar",
  "RE": "Réunion",
  "RO": "Romania",
  "RU": "Russian Federation",
  "RW": "Rwanda",
  "BL": "Saint Barthélemy",
  "SH": "Saint Helena",
  "KN": "Saint Kitts and Nevis",
  "LC": "Saint Lucia",
  "MF": "Saint Martin (French part)",
  "PM": "Saint Pierre and Miquelon",
  "VC": "Saint Vincent and the Grenadines",
  "WS": "Samoa",
  "SM": "San Marino",
  "ST": "Sao Tome and Principe",
  "SA": "Saudi Arabia",
  "SN": "Senegal",
  "RS": "Serbia",
  "SC": "Seychelles",
  "SL": "Sierra Leone",
  "SG": "Singapore",
  "SX": "Sint Maarten (Dutch part)",
  "SK": "Slovakia",
  "SI": "Slovenia",
  "SB": "Solomon Islands",
  "SO": "Somalia",
  "ZA": "South Africa",
  "GS": "South Georgia and the South Sandwich Islands",
  "SS": "South Sudan",
  "ES": "Spain",
  "LK": "Sri Lanka",
  "SD": "Sudan",
  "SR": "Suriname",
  "SJ": "Svalbard and Jan Mayen",
  "SZ": "Swaziland",
  "SE": "Sweden",
  "CH": "Switzerland",
  "SY": "Syrian Arab Republic",
  "TW": "Taiwan",
  "TJ": "Tajikistan",
  "TZ": "Tanzania",
  "TH": "Thailand",
  "TL": "Timor-Leste",
  "TG": "Togo",
  "TK": "Tokelau",
  "TO": "Tonga",
  "TT": "Trinidad and Tobago",
  "TN": "Tunisia",
  "TR": "Turkey",
  "TM": "Turkmenistan",
  "TC": "Turks and Caicos Islands",
  "TV": "Tuvalu",
  "UG": "Uganda",
  "UA": "Ukraine",
  "AE": "United Arab Emirates",
  "GB": "United Kingdom",
  "US": "United States",
  "UM": "United States Minor Outlying Islands",
  "UY": "Uruguay",
  "UZ": "Uzbekistan",
  "VU": "Vanuatu",
  "VE": "Venezuela",
  "VN": "Viet Nam",
  "VG": "Virgin Islands, British",
  "VI": "Virgin Islands, U.S.",
  "WF": "Wallis and Futuna",
  "EH": "Western Sahara",
  "YE": "Yemen",
  "ZM": "Zambia",
  "ZW": "Zimbabwe",
};


// list with city objects
// sorted in ASC order
CITIES = _.sortBy(cities, 'name');

// array of city names
CITYNAMES = _.pluck(cities, 'name').sort()

// array of city keys
CITYKEYS = _.pluck(cities, 'key').sort()

// another representation of cities using a map datastructure
// where you can access a city by lookup the key in this map/object.
CITYMAP = _.indexBy(CITIES, 'key');

// a map containing country codes associated with their cities
COUNTRYMAP = _.groupBy(CITIES, 'country');
