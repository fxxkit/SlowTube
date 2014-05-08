$(function(){
	console.log('This is SloeTube');
	SlowTube.init();
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
		var $container = $('<div/>').attr({"id": "slowTube-controller-container"}).addClass("slowTube-controller-container").hide();
		var $container_wrap = $('<span/>').addClass("slowTube-controller-container-wrap");
		var $playerBtn_mask = $('<button/>').addClass('playerBtn_mask glyphicon glyphicon-record');
		//Append to Youtube
		$btnGroup.append($startBtn).append($stopBtn);
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
		$('#slowTube-controller-menu').on('click',function(){
			SlowTube.showController();
			console.log($('#movie_player').position());
			console.log('height:' + $('#movie_player').height());
			console.log('width:' + $('#movie_player').width());
		});
		$('#movie_player').on('resize',function(){
			console.log('Player resize!!');
			SlowTube.menuLocate($container_wrap);

		});
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

		var menuBtn_left = playerPosition['left'] + playerWidth - 320;
		var menuBtn_top = playerPosition['top'] + playerHeight - 30;
		$container_wrap.css({'left': menuBtn_left, 'top': menuBtn_top});


		var maskBtn_left = playerPosition['left'];
		var maskBtn_top = playerPosition['top'] + playerHeight - 25;
		$playerBtn_mask.css({'left': maskBtn_left, 'top': maskBtn_top});
	}
}

function delayContinuePlay(ytplayer, playerType){
	if(playerType == 'AS3'){
		ytplayer.pauseVideo();
	}
	else if(playerType == 'HTML5'){
		$(ytplayer).find('.ytp-button-play').click();
	}
}