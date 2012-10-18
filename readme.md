ReConstitution 2012 (FrontEnd)
==============================

## Notes ##

* See Reconstitution 2012 | Software Notes for more info getting setup.
* See Reconstitution 12 | Data and Stats doc for message specs.

## Overview ##

Every four years our nation’s potential leaders throw off the gloves and duke
it out on the big stage. For the previous two elections, Sosolimited performed
live audiovisual remixes of these Presidential Debates.

This year, we’ve upped the stakes with our newest project, ReConstitution 2012.
Part data visualization, part experimental typography, ReConstitution 2012 is a
live web app linked to the televised US Presidential Debates.

*Much of the FrontEnd code relies on the recon\_backend server to be running in
order to receive data.*

## Getting started ##

To install and get the ReConstitution FrontEnd running, you will need two open
source technologies:

* [Node.js](http://nodejs.org)
* [grunt-bbb](http://github.com/backbone-boilerplate/grunt-bbb)

Once these are installed, clone or download the repository and change directory
into it.  From there run...

``` bash
npm init
```

...to fetch all the required dependencies.

## Running the server ##

While in the `recon_frontend` folder, run the following command...

``` bash
bbb server
```
...to get the server running.

Open up a browser and navigate to:
[http://localhost:8000](http://localhost:8000)

### Development arguments ###

Do not use any arguments if you want live cc streaming from OF app.  An
example of arguments is `index.html?docName=2008_2.txt&delay=100`

* `docName` Filename to load from the `recon_backend` project. Place documents
  in the documents folder in `recon_backend`.
* `delay` Timeout between each message in milliseconds.  Defaults to 0.
* `nosocket` Used to disable the socket from attempting to make a connection.`

## BBB documentation ##

View the Backbone Boilerplate documentation here:

[GitHub Wiki](https://github.com/tbranyen/backbone-boilerplate/wiki)
