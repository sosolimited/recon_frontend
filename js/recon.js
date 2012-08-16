/*

packet values - word, emo, speaker, cat (array), sentence, phrase

*/

// parseUri 1.2.2
// (c) Steven Levithan <stevenlevithan.com>
// MIT License

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};


// open socket connection
var socket;
var firstconnect = true;

function connect() {
	if(firstconnect) {

		socket = io.connect("http://localhost:8081");
		var args = parseUri(document.URL).queryKey;
	    var d = args.delay ? parseFloat(args.delay) : 0;
	    if (args.docName)
			socket.emit('loadDoc', { docName: args.docName, delay: d });
	}
	else {
		socket.socket.reconnect();
	}
  
  
    socket.on('message', function(data){ message(data); });
    
    socket.on('connect', function(){ status_update("Connected to Server");
     });
    socket.on('disconnect', function(){ status_update("Disconnected from Server");
     });
    socket.on('reconnect', function(){ status_update("Reconnected to Server");
     });
    socket.on('reconnecting', function( nextRetry ){ status_update("Reconnecting in " + nextRetry + " seconds");
       });
    socket.on('reconnect_failed', function(){ message("Reconnect Failed"); 
    });
      
    firstconnect = false;
    
    resize();
}
    
function disconnect() {
  socket.disconnect();
}
   
// handle incoming words/data
function message(data) {
  if (data['word']) {
  
  	//if (data['speaker'])
	//	$('#ccFeed').append('<span class="cc-text-speaker">' +data['speaker'] + ': </span>');
  
  	if (data['emo'] === 'pos')
	     $('#ccFeed').append('<span class="cc-text-pos">');
	else if (data['emo'] === 'neg')
	     $('#ccFeed').append('<span class="cc-text-neg">');
	else
	     $('#ccFeed').append('<span class="cc-text-normal">'); 
	     
	$('#ccFeed').append(data['word']+'</span> ');
	
	// scroll to bottom of div after word add
 	$('#ccFeed').animate({ scrollTop: $("#ccFeed").prop("scrollHeight") }, 0);
  }
}
    
function status_update(txt){
 // $('#status').append(txt);
}

function resize() {
	status_update("HI");
    $('#ccFeed').css({height:$(window).height()- $('#ccFeed').offset().top});
}

window.onresize = resize;
