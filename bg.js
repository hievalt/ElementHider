chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if (changeInfo.url) {
		// console.log('Tab %d got new URL: %s', tabId, changeInfo.url);
		chrome.tabs.sendMessage(tabId, {
			greeting: 'urlChange'
		});
	}
});