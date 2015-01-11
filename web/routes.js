// ROUTES

// Define routes here.
// 
// These routes are shared between client and server.
// The actual router is implemented in /client/router.js
// Furthermore, every route have a corresponding RouteController located
// in the /client/pages/{page}/{page}.js files.
// 
// The server-only routes aren't here, but only defined in /server/router.js

var routes = [

  // staff routes
  [ 'admin'                 , '/admin'                  ],
  [ 'admin_dashboard'       , '/admin/dashboard'        ],
  [ 'admin_highlights'      , '/admin/highlights'       ],
  [ 'admin_hackers'         , '/admin/hackers'          ],
  [ 'admin_deals'           , '/admin/deals'            ],
  [ 'admin_places'          , '/admin/places'           ],
  [ 'admin_growth'          , '/admin/growth'           ],
  [ 'admin_emailTemplates'  , '/admin/emailTemplates'   ],

  // normal routes
  [ 'frontpage'    , '/'                     ],
  [ 'about'        , '/about'                ],
  [ 'agenda'       , '/agenda'               ],
  [ 'books'        , '/books'                ],
  [ 'hackers'      , '/hackers'              ],
  [ 'highlights'   , '/highlights'           ],
  [ 'invitations'  , '/invitations'          ],
  [ 'map'          , '/map'                  ],
  [ 'deals'        , '/deals'                ],
  
  // special routes (which will redirect)
  [ 'logout'       , '/logout'               ],
  [ 'verifyEmail'  , '/verify-email/:token'  ],
  [ 'growth_github', '/gh/:phrase'           ], // e.g. /gh/FDMwdYYXxMY7dLcD4
  [ 'invite'       , '/+/:inviteBitHash/'    ], // e.g. /+/---_--

  // bare routes (must defined as last in this list)
  [ 'hacker'       , '/:bitHash'             ], // e.g. /--_-_-
  

];


_.each(routes, function(route) {
  Router.route(route[1], {name: route[0]});
});