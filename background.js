console.log("Background script running");

chrome.webRequest.onCompleted.addListener(
    function(details) {
        console.log("Request completed:", details);
        // Inject the content script
        if (details.url == "https://chat.openai.com/backend-api/conversation") {
            chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
        }
        console.log(details.url);   
    },
    // filters
    {
        urls: ["https://chat.openai.com/backend-api/conversation*"]
    }
);
  