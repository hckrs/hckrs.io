README
======

Mac OS X
--------

Easily run some .command script by simply double-click the file.

But only once you have to set executable permissions for these files.
Therefore you must open the terminal, navigate to the `tools` folder.
In my case that means `cd /Users/Jarno/hckrs/tools` and then run:

find . -type f -name "*.command" -exec chmod a+x {} \;

