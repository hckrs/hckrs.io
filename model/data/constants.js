// CONSTANTS 
// some of this data can be moved to the database in the future


HACKING = ['web','apps','software','game','design','life','hardware','opensource','growth'].sort();

ITEM_TYPES = ["article", "ask", "audio", "book", "event", "hack", "location", "picture", "product", "show", "video", "work"];

SKILLS = [{"name":"ABAP"},{"name":"ASP"},{"name":"ASP.NET"},
{"name":"ActionScript"},{"name":"Ada"},{"name":"Android"},{"name":"Angular.js"},
{"name":"Apache"},{"name":"ApacheConf"},{"name":"Apex"},
{"name":"AppleScript"},{"name":"Arc"},{"name":"Arduino"},
{"name":"Assembly"},{"name":"Augeas"},{"name":"AutoHotkey"},
{"name":"Awk"},{"name":"Backbone.js"},{"name":"Batch"},{"name":"Befunge"},
{"name":"BigTable"},{"name":"BlitzMax"},{"name":"Boo"},
{"name":"Brainfuck"},{"name":"Bro"},{"name":"C"},{"name":"C#"},
{"name":"C++"},{"name":"C-ObjDump"},{"name":"C2hs Haskell"},
{"name":"CLIPS"},{"name":"CMake"},{"name":"CSS"},{"name":"CakePHP"},{"name":"Catalyst"},{"name":"Cappuccino.js"},
{"name":"Ceylon"},{"name":"CherryPy"},{"name":"ChucK"},
{"name":"Clojure"},{"name":"Cobol"},,{"name":"CodeIgniter"},{"name":"CoffeeScript"},
{"name":"ColdFusion"},{"name":"Common.js"},{"name":"Common Lisp"},{"name":"Coq"},{"name":"Cocoa"},
{"name":"CouchDB"},{"name":"Cpp-ObjDump"},{"name":"Cuba"},
{"name":"Cucumber"},{"name":"Cython"},{"name":"D"},
{"name":"D-ObjDump"},{"name":"DCPU-16 ASM"},{"name":"Dojo.js"},{"name":"DOT"},
{"name":"Dancer"},{"name":"Darcs Patch"},{"name":"Dart"},{"name":"Delphi"},
{"name":"Diff"},{"name":"Django"},{"name":"Drupal"},{"name":"Dylan"},
{"name":"Ecere Projects"},{"name":"Ecl"},{"name":"Eiffel"},
{"name":"Elixir"},{"name":"Elm"},{"name":"Emacs Lisp"},{"name":"Embed.js"},{"name":"Ember.js"},{"name":"Enyo.js"},
{"name":"Erlang"},{"name":"Ext GWT"},{"name":"Ext.js"},{"name":"Express.js"},{"name":"Flash"},{"name":"F#"},
{"name":"FBML"},{"name":"Factor"},{"name":"Fancy"},
{"name":"Fantom"},{"name":"Forth"},{"name":"Fortran"},
{"name":"GAS"},{"name":"Genshi"},{"name":"Gentoo Ebuild"},
{"name":"Gentoo Eclass"},{"name":"Gettext Catalog"},
{"name":"Go"},{"name":"Google Web Toolkit"},{"name":"Google Maps"},{"name":"Gosu"},{"name":"Groff"},{"name":"Groovy"},
{"name":"Groovy Server Pages"},{"name":"HTML"},{"name":"Haml"},{"name":"Handlebars"},
{"name":"Haskell"},{"name":"Haxe"},{"name":"IIS"},
{"name":"IRC log"},{"name":"Io"},{"name":"Ioke"},{"name":"Joomla!"},{"name":"J2EE"},
{"name":"JSON"},{"name":"Java"},{"name":"Java Server Pages"},
{"name":"JavaScript"},{"name":"JavaScriptMVC"},{"name":"Jasmine.js"},{"name":"Julia"},,{"name":"Karrigell"},{"name":"Knockout.js"},{"name":"Kotlin"},
{"name":"LLVM"},{"name":"Lasso"},{"name":"Leaflet.js"},{"name":"Less"},{"name":"LilyPond"},
{"name":"Linux"},{"name":"Lisp"},{"name":"Literate CoffeeScript"},
{"name":"Literate Haskell"},{"name":"Lithium"},{"name":"LiveScript"},{"name":"Logos"},
{"name":"Logtalk"},{"name":"Lua"},{"name":"MapBox"},{"name":"Makefile"},{"name":"Mako"},
{"name":"MariaDB"},{"name":"Markdown"},{"name":"Matlab"},
{"name":"Max"},{"name":"Meteor"},{"name":"Microsoft SQL Server"},{"name":"MiniD"},
{"name":"Mirah"},{"name":"Mobilize.js"},{"name":"Modernizr.js"},{"name":"Mojolicious"},{"name":"MongoDB"},{"name":"Monkey"},
{"name":"Moocode"},{"name":"MoonScript"},{"name":"MooTools"},{"name":"MySQL"},
{"name":"Myghty"},{"name":"NSIS"},{"name":"Nemerle"},{"name":"Nginx"},
{"name":"Nimrod"},{"name":"Node.js"},{"name":"NoSQL"},{"name":"Nu"},{"name":"NumPy"},
{"name":"OCaml"},{"name":"OSX"},{"name":"ObjDump"},{"name":"Objective-C"},
{"name":"Objective-J"},{"name":"Omgrofl"},{"name":"Opa"},
{"name":"OpenGL"},{"name":"OpenCL"},{"name":"OpenEdge ABL"},{"name":"Oracle"},
{"name":"PhoneGap"},{"name":"PHP"},{"name":"Parrot"},{"name":"Parrot Assembly"},
{"name":"Parrot Internal Representation"},{"name":"Pascal"},
{"name":"Perl"},{"name":"Pike"},{"name":"PogoScript"},
{"name":"PostgreSQL"},{"name":"PowerShell"},{"name":"Prolog"},{"name":"Prototype"},
{"name":"Puppet"},{"name":"Pure Data"},{"name":"Python"},
{"name":"Python traceback"},{"name":"R"},{"name":"RHTML"},
{"name":"Racket"},{"name":"Ragel in Ruby Host"},
{"name":"Raw token data"},{"name":"Rebol"},{"name":"Redcode"},
{"name":"Redis"},{"name":"Rexx"},{"name":"Rouge"},
{"name":"Ruby"},{"name":"Ruby on Rails"},{"name":"Rust"},{"name":"Scrapy"},{"name":"Script.aculo.us"},
{"name":"SCSS"},{"name":"SQL"},{"name":"Sage"},{"name":"Sass"},
{"name":"Scala"},{"name":"Scheme"},{"name":"Scilab"},
{"name":"Self"},{"name":"Shell"},{"name":"Sinatra"},
{"name":"Smalltalk"},{"name":"Smarty"},{"name":"Socket.io"},{"name":"Sproutcore"},{"name":"Standard ML"},
{"name":"Struts"},{"name":"SuperCollider"},,{"name":"Symfony"},{"name":"TOML"},
{"name":"TXL"},{"name":"Tcl"},{"name":"Tcsh"},{"name":"TeX"},
{"name":"Tea"},{"name":"Textile"},{"name":"Turing"},
{"name":"Twig"},{"name":"Twisted"},{"name":"Twitter bootstrap"},{"name":"TypeScript"},{"name":"TYPO3"},{"name":"Underscore.js"},{"name":"Unix"},
{"name":"VHDL"},{"name":"Vanilla.js"},{"name":"Vala"},{"name":"Verilog"},{"name":"VimL"},
{"name":"Visual Basic"},{"name":"Web2py"},{"name":"Windows"},{"name":"XHP"},
{"name":"XML"},{"name":"XProc"},{"name":"XQuery"},{"name":"XS"},
{"name":"XSLT"},{"name":"Xtend"},{"name":"xui.js"},{"name":"YAML"},{"name":"Yii Framework"},{"name":"YUI"},{"name":"Zend"},
{"name":"eC"},{"name":"edn"},{"name":"fish"},{"name":"jQuery"},
{"name":"mupad"},{"name":"ooc"},{"name":"reStructuredText"},{"name":"Zope"},{"name":"ZURB Foundation"}];

SKILL_NAMES = _.map(SKILLS, function(skill) { return skill.name; });






