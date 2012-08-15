/*

packet values - word, emo, speaker, cat (array), sentence, phrase

*/


var socket;
var firstconnect = true;
var localCCWords;
var localCCIndex;
var modeDivs;

function connect() {
	
	/* //TEMP moving to local word release method
	if(firstconnect) {
		socket = io.connect("http://sosoprojects.com:8080");
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
    */




	//create array of mode containers
	modeDivs = [4];
	modeDivs[0] = $('#div0');
	modeDivs[1] = $('#div1');
	modeDivs[2] = $('#div2');
	modeDivs[2] = $('#div3');

	showMode(0);

	//for(var i=0; i < modeDivs.length; i++){
	//	if(i!=0) modeDivs[i].style.visibility = 'hidden';
	//	modeDivs[i].style.backgroundColor = 'yellow';
	//}
	
	//$('#div1').style.visibility = hidden;
	//$('#div2').style.visibility = hidden;

		

	//create array of words for local CC releasing
	var testString = "So many good and decent people seem to be running harder just to stay in place. And -- and for many, no matter how hard they -- they're running, every day it seems to put them a little further behind. It's that way across so much of America, too much of America. Under this president's watch, more Americans have lost their jobs than during any other period since the Depression.";
	localCCWords = testString.split(" ");
	localCCIndex = 0;	


	//initiate fake local CC timer
	releaseLocalWord();
	
    
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
  $('#status').text(txt);
}

function resize() {
	
	//status_update("HI");
    //$('#div0').css({height:$(window).height() - $('#div0').offset().top});
}

//functions for releasing CC locally for testing
function releaseLocalWord() {
		
	var r = Math.random();
	var el; 
	
	
	if(r < 0.1)	
		el = $('<span class="cc-text-neg"/>').text(localCCWords[localCCIndex++ % localCCWords.length] + ' ');	
	else if(r>=0.1 && r<0.2)
		el = $('<span class="cc-text-pos"/>').text(localCCWords[localCCIndex++ % localCCWords.length] + ' ');
	else
		el = $('<span class="cc-text-normal"/>').text(localCCWords[localCCIndex++ % localCCWords.length] + ' ');
	
	//assign click function
	el.click(selectWord);
	//add to container
	$('#div0').append(el);	
		

	//grab last child of div and add an onClick function, so we have access to this inside of the function
	//$('#ccFeed').last().onclick = clickWord;

	// scroll to bottom of div after word add
 	$('#div0').animate({ scrollTop: $("#div0").prop("scrollHeight") }, 0);


	setTimeout(releaseLocalWord, 1000 * (0.05 + 0.7*Math.random()));
}

function selectWord(){
	this.style.color = 'rgb(200,200,200)'; 
}


function showMode(index){
	//show and hide mode divs
	for(var i=0; i < modeDivs.length; i++){
		if(i===index)
			modeDivs[i].css({"z-index":"0", "visibility":"visible"});
		else
			modeDivs[i].css({"z-index":"-1", "visibility":"hidden"});
		
	}
	
	//color nav list elements
	var i=0;
	$('#navList').children('li').each(function(){
		if(i===index) $(this).css({"color":"white"});
		else $(this).css({"color":"rgb(100,100,100)"});
		
		i++;
	});	
	
	
}


window.onresize = resize;
