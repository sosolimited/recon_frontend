recon_frontend
====================

## About boilerplate ##

This boilerplate is the product of much research and frustration.  Existing
boilerplates freely modify Backbone core, lack a build process, and are very
prescriptive; Backbone Boilerplate changes that.

Organize your application in a logical filesystem, develop your
Models/Collections/Views/Routers inside modules, and build knowing you have
efficient code that will not bottleneck your users.

Thanks to our
[Contributors](https://github.com/tbranyen/backbone-boilerplate/contributors)!

Special Thanks to: [cowboy](http://github.com/cowboy),
[iros](http://github.com/iros), [nimbupani](http://github.com/nimbupani),
[wookiehangover](http://github.com/wookiehangover), and
[jugglinmike](http://github.com/jugglinmike) for helping me create this project.

Extra Special Thanks to: [Paul Guinan](http://bigredhair.com/work/paul.html)
for giving me usage rights to his fantastic Boilerplate character.

## BBB documentation ##

View the Backbone Boilerplate documentation here:

[GitHub Wiki](https://github.com/tbranyen/backbone-boilerplate/wiki)

## BBB Build process ##

To use the new and improved build process, please visit the 
[grunt-bbb](https://github.com/backbone-boilerplate/grunt-bbb)
plugin repo and follow the instructions to install.  Basing your project off
this repo will allow the `bbb` commands to work out-of-the-box.

npm install -g bbb


## To run ##

bbb server


See Reconstitution 2012 | Software Notes for more info getting setup.

recon_backend server must be running for data to be received on frontend.

Use args docName and delay (in ms) to simluate streaming. Place documents in the /documents folder in the backend directory, there are some there already. If no delay is entered, it defaults to 0 (all data received at once) ex: index.html?docName=2008_2.txt&delay=100.

Use no args if you want live cc streaming from OF app.

See Reconstitution 12 | Data and Stats doc for message specs.