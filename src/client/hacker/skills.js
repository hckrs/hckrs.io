
/* SKILLS */

// get the information of the hacker on the current page
// this session variable 'hacker' is setted in the router
var hacker = function () { return Session.get('hacker'); }
var hackerId = function () { return Session.get('hackerId'); }



// helper function to check if user has the given skill
var hackerHasSkill = function(skill) {
  return _.contains(hacker().profile.skills, skill.name);
}

// helper function to check if user has marked the given skill als favorite
var isFavoriteSkill = function(skill) {
  return _.contains(hacker().profile.favoriteSkills, skill.name);
}

// replace all user's skills by the values entered in the chosen-select input field
var updateSkills = function(skillNames) {
  Meteor.users.update(hackerId(), {$set: {"profile.skills": skillNames}});
  cleanFavorites();
}

// mark or unmark a skill as favorite
var addFavorite = function(skill) {
  Meteor.users.update(hackerId(), {$addToSet: {"profile.favoriteSkills": skill.name}}); // add
}
var removeFavorite = function(skill) {
  Meteor.users.update(hackerId(), {$pull: {"profile.favoriteSkills": skill.name}}); // remove
}

// skills that arn't in user's skills list can not be marked as favorite, remove them!
var cleanFavorites = function() {
  var favorites = _.intersection(hacker().profile.skills, hacker().profile.favoriteSkills);
  Meteor.users.update(hackerId(), {$set: {"profile.favoriteSkills": favorites }});
}



// EVENTS

Template.editSkills.events({
  "click .toggle-favorite": function() { isFavoriteSkill(this) ? removeFavorite(this) : addFavorite(this); }
});



// TEMPLATE DATA

Template.skills.helpers({
  "hackerSkills": function() { return _.filter(SKILLS, hackerHasSkill); },
  "isFavorite": function() { return isFavoriteSkill(this); }
});

Template.editSkills.helpers({
  "allSkills": function() { return SKILLS; },
  "hackerSkills": function() { return _.filter(SKILLS, hackerHasSkill); },
  "hasSkill": function() { return hackerHasSkill(this); },
  "isFavorite": function() { return isFavoriteSkill(this); }
});



// REDERING 


Template.editSkills.rendered = function() {
  $(".input-skills").chosen().change(function(event) {
    var values = $(event.currentTarget).val();
    updateSkills(values);
  });
}



// CONSTANTS 

var SKILLS = [{"name":"ABAP"},{"name":"ASP"},{"name":"ASP.NET"},
{"name":"ActionScript"},{"name":"Ada"},{"name":"Android"},
{"name":"Apache"},{"name":"ApacheConf"},{"name":"Apex"},
{"name":"AppleScript"},{"name":"Arc"},{"name":"Arduino"},
{"name":"Assembly"},{"name":"Augeas"},{"name":"AutoHotkey"},
{"name":"Awk"},{"name":"Batchfile"},{"name":"Befunge"},
{"name":"BigTable"},{"name":"BlitzMax"},{"name":"Boo"},
{"name":"Brainfuck"},{"name":"Bro"},{"name":"C"},{"name":"C#"},
{"name":"C++"},{"name":"C-ObjDump"},{"name":"C2hs Haskell"},
{"name":"CLIPS"},{"name":"CMake"},{"name":"CSS"},{"name":"CakePHP"},
{"name":"Ceylon"},{"name":"CherryPy"},{"name":"ChucK"},
{"name":"Clojure"},{"name":"Cobol"},{"name":"CoffeeScript"},
{"name":"ColdFusion"},{"name":"Common Lisp"},{"name":"Coq"},
{"name":"CouchDB"},{"name":"Cpp-ObjDump"},{"name":"Cuba"},
{"name":"Cucumber"},{"name":"Cython"},{"name":"D"},
{"name":"D-ObjDump"},{"name":"DCPU-16 ASM"},{"name":"DOT"},
{"name":"Darcs Patch"},{"name":"Dart"},{"name":"Delphi"},
{"name":"Diff"},{"name":"Django"},{"name":"Dylan"},
{"name":"Ecere Projects"},{"name":"Ecl"},{"name":"Eiffel"},
{"name":"Elixir"},{"name":"Elm"},{"name":"Emacs Lisp"},
{"name":"Erlang"},{"name":"Ext GWT"},{"name":"F#"},
{"name":"FBML"},{"name":"Factor"},{"name":"Fancy"},
{"name":"Fantom"},{"name":"Forth"},{"name":"Fortran"},
{"name":"GAS"},{"name":"Genshi"},{"name":"Gentoo Ebuild"},
{"name":"Gentoo Eclass"},{"name":"Gettext Catalog"},
{"name":"Go"},{"name":"Gosu"},{"name":"Groff"},{"name":"Groovy"},
{"name":"Groovy Server Pages"},{"name":"HTML"},
{"name":"HTML+Django"},{"name":"HTML+ERB"},{"name":"HTML+PHP"},
{"name":"HTTP"},{"name":"Haml"},{"name":"Handlebars"},
{"name":"Haskell"},{"name":"Haxe"},{"name":"IIS"},{"name":"INI"},
{"name":"IRC log"},{"name":"Io"},{"name":"Ioke"},{"name":"J2EE"},
{"name":"JSON"},{"name":"Java"},{"name":"Java Server Pages"},
{"name":"JavaScript"},{"name":"Julia"},{"name":"Kotlin"},
{"name":"LLVM"},{"name":"Lasso"},{"name":"Less"},{"name":"LilyPond"},
{"name":"Linux"},{"name":"Lisp"},{"name":"Literate CoffeeScript"},
{"name":"Literate Haskell"},{"name":"LiveScript"},{"name":"Logos"},
{"name":"Logtalk"},{"name":"Lua"},{"name":"Makefile"},{"name":"Mako"},
{"name":"MariaDB"},{"name":"Markdown"},{"name":"Matlab"},
{"name":"Max"},{"name":"Microsoft SQL Server"},{"name":"MiniD"},
{"name":"Mirah"},{"name":"MongoDB"},{"name":"Monkey"},
{"name":"Moocode"},{"name":"MoonScript"},{"name":"MySQL"},
{"name":"Myghty"},{"name":"NSIS"},{"name":"Nemerle"},{"name":"Nginx"},
{"name":"Nimrod"},{"name":"NoSQL"},{"name":"Nu"},{"name":"NumPy"},
{"name":"OCaml"},{"name":"ObjDump"},{"name":"Objective-C"},
{"name":"Objective-J"},{"name":"Omgrofl"},{"name":"Opa"},
{"name":"OpenCL"},{"name":"OpenEdge ABL"},{"name":"Oracle"},
{"name":"PHP"},{"name":"Parrot"},{"name":"Parrot Assembly"},
{"name":"Parrot Internal Representation"},{"name":"Pascal"},
{"name":"Perl"},{"name":"Pike"},{"name":"PogoScript"},
{"name":"PostgreSQL"},{"name":"PowerShell"},{"name":"Prolog"},
{"name":"Puppet"},{"name":"Pure Data"},{"name":"Python"},
{"name":"Python traceback"},{"name":"R"},{"name":"RHTML"},
{"name":"Racket"},{"name":"Ragel in Ruby Host"},
{"name":"Raw token data"},{"name":"Rebol"},{"name":"Redcode"},
{"name":"Redis"},{"name":"Rexx"},{"name":"Rouge"},
{"name":"Ruby"},{"name":"Ruby on Rails"},{"name":"Rust"},
{"name":"SCSS"},{"name":"SQL"},{"name":"Sage"},{"name":"Sass"},
{"name":"Scala"},{"name":"Scheme"},{"name":"Scilab"},
{"name":"Self"},{"name":"Shell"},{"name":"Sinatra"},
{"name":"Smalltalk"},{"name":"Smarty"},{"name":"Standard ML"},
{"name":"Struts"},{"name":"SuperCollider"},{"name":"TOML"},
{"name":"TXL"},{"name":"Tcl"},{"name":"Tcsh"},{"name":"TeX"},
{"name":"Tea"},{"name":"Textile"},{"name":"Turing"},
{"name":"Twig"},{"name":"TypeScript"},{"name":"Unix"},
{"name":"VHDL"},{"name":"Vala"},{"name":"Verilog"},{"name":"VimL"},
{"name":"Visual Basic"},{"name":"Windows"},{"name":"XHP"},
{"name":"XML"},{"name":"XProc"},{"name":"XQuery"},{"name":"XS"},
{"name":"XSLT"},{"name":"Xtend"},{"name":"YAML"},{"name":"Zend"},
{"name":"eC"},{"name":"edn"},{"name":"fish"},{"name":"jQuery"},
{"name":"mupad"},{"name":"ooc"},{"name":"reStructuredText"}];

