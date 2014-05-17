console.log("This is background for SlowTube")

chrome.webNavigation.onHistoryStateUpdated.addListener(function(e){
		var historyStateURL = e.url;
        console.log(e.url);



        var delayMsgPassHandler = _.bind(delayMsgPassing);
        _.delay(delayMsgPassHandler,4000,historyStateURL);            
        //setTimeout("delayMsgPassing(" + historyStateURL + ")", 3000);
    }, 
    {url: [{hostSuffix: 'www.youtube.com'}]}
);

function delayMsgPassing(url){
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
		chrome.tabs.sendMessage(tabs[0].id, {url: url}, function(response) {
		  console.log('sending msg to content scripts via chrome.tabs');
		});
	});
}
