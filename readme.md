ReConstitution 2012 (FrontEnd)
==============================

## Overview ##

Every four years our nation’s potential leaders throw off the gloves and duke
it out on the big stage. For the previous two elections, Sosolimited performed
live audiovisual remixes of these Presidential Debates.

This year, we’ve upped the stakes with our newest project, ReConstitution 2012.
Part data visualization, part experimental typography, ReConstitution 2012 is a
live web app linked to the televised US Presidential Debates.

We said we would, so here it is. Reconstitution 2012, the source. In the name of letting go, we've decided to release first and house keep later. Eventually we’ll get around to cleaning up and organizing the code into a more generalized and unobtuse package. 

What exactly does it do? Reconstitution 2012 is a web platform that uploads, processes, and distributes closed captioning data in real time. Like most things in the spacetime continuum, it has a back end and a front end.

The backend server is written in Javascript, with Node.js. It takes a stream of characters, through a TCP-IP socket, and parses the incoming stream into words and sentences. In the original use-case, this stream was closed captioning text extracted from a live television broadcast, but it can be anything.
 
The server parses the incoming character stream into words and sentences. It performs a lookup on each word into the Linguistic Inquiry Word Count (LIWC) database. The parsed language is also run through two Java apps—the Standford Named Entity Recognizer, to determine proper capitalization, and Sentistrength, to determine the emotional strength of each sentence. The words and sentences are tagged and stored in a MongoDB database. The server then sends each word, tagged with a collection of meta-data, to all connected clients.  

The front-end is written in Javascript with a Backbone.js architecture. It is held together with Tim Branyen’s sweet Backbone Boilerplate aka BBB. There are three main views: landing, transcript, and comparisons. The landing view lets you choose between the three debates. The transcript processes and assembles the word messages into a three column layout, with a colorful collection of linguistic markup, overlays, and animations. Finally, the comparison view shows a collection of graphs charting various psychological traits for the speakers.

The front end uses several libraries and frameworks including BBB, Skrollr, and engine.io, and takes advantage of CSS3, HTML5, and Websockets. It is best viewed on Chrome or Safari, and works pretty well on Firefox. 

Reconstitution was coded by Sosolimited, with Tim Branyen and Bocoup.

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

## Message specs ##

Sent to all clients, every word
{	
  type: ”word”, 
  timeDiff: int,
dbid: (uniquewords_id) int,
  word: string, 
  speaker: int 
  cats: string[], 
  sentenceStartFlag: bool, 
  punctuationFlag: bool,
  wordInstances: int, 
  ngrams: [ [ngramID, ngramInstances], ... ]
}


Sent to all clients, every sentence end
{	
type: ”sentenceEnd”, 
timeDiff: int,
  speaker: int,
  sentiment: [ pos energy(int), neg energy (int), [ {word: string, value: int} ] ],
  length: int
}

Sent to all clients, every time new n-gram is found ( when more than 3 instances have appeared)
{	
  type: ”newNGram”, 
  timeDiff: int,
  dbid: int,
  ngram: string[],
  instances: string[] //word ids of last words
}

Sent to all clients, every n seconds
{	
type: ”livestate”, 
  debate: int
}

Sent to all clients, every n seconds
{	
  type: “stats”,
  timeDiff: int,
  posemo: float[2],
  negemo: float[2],
  anger: float[2],
  I: float[2],
  we: float[2],
  complexity: float[2],
  status: float[2],
  depression: float[2],
  formality: float[2],
  honesty: float[2]
}



