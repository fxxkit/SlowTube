var currentURL = '';
chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse){
	console.log('[Slowtube]receive msg from background scripts');
	//prevent duplicate button append
	if(currentURL != msg.url){
		if (msg.url.indexOf('www.youtube.com/watch') != -1){
			console.log('[Slowtube] init');
			if($('#body-container').find('.slowTube-controller-container-wrap').length === 0)
				SlowTube.init();				
		}
		else{
			console.log('[Slowtube] de_init');
			SlowTube.de_init();
		}
	}
	currentURL = msg.url;
});	

var SlowTube = {
	slowFreqId: null,
	displayController: false,
	init: function(){
		//Generate DOM
		var $sideBar = $('<input/>').attr({"type":"range","min":100, "max":1000, "id": "slowTube-controller"});
		var $menuBtn = $('<button/>').attr({"id": "slowTube-controller-menu"}).addClass("slowTube-controller-menu glyphicon glyphicon-film")
		var $btnGroup = $('<div/>').addClass('btn-group');
		var $stopBtn = $('<button/>').attr({"id": "slowTube-controller-stop"}).addClass("btn btn-default btn-xs").html('Stop');
		var $startBtn = $('<button/>').attr({"id": "slowTube-controller-start"}).addClass("btn btn-default btn-xs").html('Start');
		var $frameBtn = $('<button/>').attr({"id": "slowTube-controller-frame"}).addClass('btn btn-default btn-xs').html('▶▍');
		var $container = $('<div/>').attr({"id": "slowTube-controller-container"}).addClass("slowTube-controller-container").hide();
		var $container_wrap = $('<span/>').addClass("slowTube-controller-container-wrap");
		var $playerBtn_mask = $('<button/>').addClass('playerBtn_mask glyphicon glyphicon-record');
		//Append to Youtube
		$btnGroup.append($startBtn).append($stopBtn).append($frameBtn);
		$container.append($sideBar).append($btnGroup);
		$container_wrap.append($menuBtn).append($container);
		$('#body-container').prepend($container_wrap);
		$('#body-container').prepend($playerBtn_mask);

		SlowTube.btnLocate($container_wrap,$playerBtn_mask);


		//Bind Event
		$('#slowTube-controller').on('mouseup',function(){
			SlowTube.startSlowMode();
		});
		$('#slowTube-controller-stop').on('click',function(){
			SlowTube.stopSlowMode();
		});
		$('#slowTube-controller-start').on('click',function(){
			SlowTube.startSlowMode();
		});
		$('.playerBtn_mask').on('click',function(){
			SlowTube.stopSlowMode();
		});
		$('#slowTube-controller-frame').on('click',function(){
			SlowTube.frameFoward();
		})
		$('#slowTube-controller-menu').on('click',function(){
			SlowTube.showController();
		});
		$('html').on('keypress',function(e){
			//console.log('keypress')
			if(e.keyCode == 102){
				SlowTube.frameFoward();
			}
		});
		// Youtube resize btn
		var $resizeBtn = $('#movie_player')
						.find('.html5-video-controls')
						.find('.html5-player-chrome')
						.find('.ytp-button').eq(5);
		$resizeBtn.on('click',function(){
			console.log('Player resize!!');
			//Hide the inject element for a while
			SlowTube.hideExtensionEl();

			var delayReposition = _.bind(SlowTube.btnLocate, SlowTube);
	  		_.delay(delayReposition, 1000,$container_wrap,$playerBtn_mask);
		});
		// Window resize event
		$(window).on('resize',function(){
			SlowTube.btnLocate($container_wrap,$playerBtn_mask);
		})

	},
	de_init: function(){
		$('.slowTube-controller-container-wrap').remove();
		$('.playerBtn_mask').remove();
	},
	slowPlaying: function(speed){
		clearInterval(SlowTube.slowFreqId); // Clear the old setInterval first
		if($('#movie_player').is('embed')){// For AS3 player
			console.log('=== This is AS3 player ===');
			console.log('speed = ' + speed);
			var ytplayer = document.getElementById('movie_player');
			var isPlaying = false;
			SlowTube.slowFreqId = setInterval(function(){
				//Pause the player
				ytplayer.playVideo();
				//Continue playing after delay
				var delayPlay = _.bind(delayContinuePlay);
	  		  	_.delay(delayPlay,speed - 50,ytplayer,'HTML5');
			},speed);
		}
		else{ // For html5 player
			console.log('=== This is html5 player ===')
			var ytplayer = $('#movie_player');
			console.log('speed = ' + speed);
			SlowTube.slowFreqId = setInterval(function () {
				//Pause the player
				$(ytplayer).find('.ytp-button-pause').click();
				//Continue playing after delay
				var delayPlay = _.bind(delayContinuePlay);
	  		  	_.delay(delayPlay,speed - 50,ytplayer,'HTML5');
			}, speed);
		}		
	},
	stopSlowMode: function(){
		clearInterval(SlowTube.slowFreqId);
		$('.playerBtn_mask').removeClass('no-occupy-show').addClass('no-occupy-hidden');
	},
	startSlowMode: function(){
		var speed = $('#slowTube-controller').val();
		SlowTube.slowPlaying(speed);
		var playerHeight = $('#movie_player').height();
		$('.playerBtn_mask').removeClass('no-occupy-hidden').addClass('no-occupy-show');
	},
	showController: function(){
		if(SlowTube.displayController == false){
			$('#slowTube-controller-menu').addClass('btn-hightlight');
			$('#slowTube-controller-container').show();
			//$('#slowTube-controller-container').removeClass('display-none');
			SlowTube.displayController = true;	
		}
		else{
			$('#slowTube-controller-menu').removeClass('btn-hightlight');
			$('#slowTube-controller-container').hide();
			//$('#slowTube-controller-container').addClass('display-none');
			SlowTube.displayController = false;				
		}
	},
	btnLocate: function($container_wrap,$playerBtn_mask){
		var playerPosition = $('#movie_player').position();
		var playerHeight = $('#movie_player').height();
		var playerWidth = $('#movie_player').width();

		var menuBtn_left = playerPosition['left'] + playerWidth - 360;
		var menuBtn_top = playerPosition['top'] + playerHeight - 28;
		$container_wrap.css({'left': menuBtn_left, 'top': menuBtn_top});


		var maskBtn_left = playerPosition['left'];
		var maskBtn_top = playerPosition['top'] + playerHeight - 25;
		$playerBtn_mask.css({'left': maskBtn_left, 'top': maskBtn_top});
		//Show the inject element again
		SlowTube.showExtensionEl();
	},
	hideExtensionEl: function(){
		$('.playerBtn_mask').css({'visibility': 'hidden'});
		$('.slowTube-controller-container-wrap').css({'visibility': 'hidden'});
	},
	showExtensionEl: function(){
		$('.playerBtn_mask').css({'visibility': 'visible'});
		$('.slowTube-controller-container-wrap').css({'visibility': 'visible'});
	},
	frameFoward: function(){
		var ytplayer = $('#movie_player');
		if($(ytplayer).hasClass('playing-mode')){
			$(ytplayer).find('.ytp-button-pause').click(); // pause the video if playing
		}
		else{// play 100ms and pause
			$(ytplayer).find('.ytp-button-play').click();
			var delayPause = _.bind(delayFramePause);
			_.delay(delayPause,40,ytplayer);
		}
	}
}

function delayFramePause(ytplayer){
	$(ytplayer).find('.ytp-button-pause').click();	
}

function delayContinuePlay(ytplayer, playerType){
	if(playerType == 'AS3'){
		ytplayer.pauseVideo();
	}
	else if(playerType == 'HTML5'){
		$(ytplayer).find('.ytp-button-play').click();
	}
}