/*

packet values - word, emo, speaker, cat (array), sentence, phrase

*/


var socket;
var firstconnect = true;

function connect() {
	if(firstconnect) {
		socket = io.connect("http://localhost:8081");
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
    
function message(data) {
  if (data['word']) {
  
	$('#ccFeed').append('<span class="cc-text-speaker">' +data['speaker'] + ': </span>');
  
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
  //$('#status').text(txt);
}

function resize() {
	status_update("HI");
    $('#ccFeed').css({height:$(window).height()- $('#ccFeed').offset().top});
}

window.onresize = resize;
