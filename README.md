hckrs.io
=========
Developing hckrs.io


Requirements
------------
First you have to make sure you have [node.js] installed on your system.
Then you can install [meteor]. For Window support please check out [win.meteor.com]

Run
---
OS X users can simply run the shell script named ``start-local-server.command`` located in the `/tools` folder by simply double-click the file. It will locally start a server and opens the hckrs website in your browser.

If you prefer to start the server manually you can run ``meteor --settings settings/dev.json``. Make sure you have exported the following environment variable `ROOT_URL=http://10.0.0.2.xip.io:3000`. Replace `10.0.0.2` with your local IP.

Only Twitter can be used by default to login on your hckrs account. If you like to login through Facebook or Github you must make sure your local IP is 10.0.0.2, because they recognize http://10.0.0.2.xip.io:3000 as the only valid URL.

When you like to interact with JavaScript on your local server you can start a REPL by running `nc localhost 5001` form the terminal.


Project structure
-----------------
Client code is in the `client` directory, server code is in the `server` directory, and all other code is shared between client and server.

The `model` directory contains the database collections and schemas. It is also the place containing allow and deny rules to check untrusted client actions.

The directories named `lib` are loaded first. We can put there our own libraries. Third-party libraries are placed there within a subfolder called `vendor`.

All client-side routes are listed in the file `/client/router.js`. Every route in that file corresponds with a single web page, each located in its own folder `/client/pages/*` containing html, javascript en stylus files.

The `public` directory serves static files to the client. All accessible via the browser relatively to the root URL.

The `private` directory contains static files that are accessible from server code only.


[node.js]:http://nodejs.org/download/
[meteor]:http://docs.meteor.com/#quickstart
[meteorite]:https://github.com/oortcloud/meteorite/
[win.meteor.com]:http://win.meteor.com

