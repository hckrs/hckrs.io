hckrs.io
=========
This repository is used to develop hckrs.io


Requirements
------------
First you have to make sure you have [node.js] installed on your system.
Then you can install [meteor] and [meteorite]. For Window support please check out [win.meteor.com]

Run
---
The basic idea is to run meteor from the command line using the local settings file.

```$ mrt run --settings settings-local.json```

Because hckrs.io heavely depends on subdomains we need to simulate these urls while developing. Use the website http://xip.io to route a public url to your local machine that is running meteor. In order to make this work you must start meteor with this command:

```$ ROOT_URL=http://10.0.0.2.xip.io mrt run --settings settings-local.json```

Where you have to replace `10.0.0.2` by your own internal IP address.

Project structure
-----------------
Client code is in the client directory, server code is in the server directory, and all other code is shared between client and server.

The directory model contains the database collections and schemas. It is also the place containing allow and deny rules to check untrusted client actions.

The directories named lib are loaded first. We can put there our own libraries. Third-party libraries are placed there within a subfolder called vendor.

All client-side routes are listed in the file /client/router.js.
Every route corresponds with a single web page. Every page is located in its own folder within /client/pages/* and contains html (.html), javascript (.js) en css (.styl). 


[node.js]:http://nodejs.org/download/
[meteor]:http://docs.meteor.com/#quickstart
[meteorite]:https://github.com/oortcloud/meteorite/
[win.meteor.com]:http://win.meteor.com
