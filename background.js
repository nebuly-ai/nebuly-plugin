console.log("Background script running");

chrome.webRequest.onCompleted.addListener(
    function(details) {
        // console.log("Request completed:", details);
        // Inject the content script
        if (details.url === "https://chat.openai.com/backend-api/conversation") {
            console.log(details)
            chrome.tabs.executeScript(details.tabId, {file: 'content.js'});
        }
        // console.log(details.url);   
    },
    // filters
    {
        urls: ["https://chat.openai.com/backend-api/conversation*"]
    }
);


chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.method === "POST" && details.requestBody && details.requestBody.raw && details.url === "https://chat.openai.com/backend-api/conversation/message_feedback") {
            // console.log("Request intercepted:", details);
            var postedString = decodeURIComponent(String.fromCharCode.apply(null, new Uint8Array(details.requestBody.raw[0].bytes)));
            var postedObject = JSON.parse(postedString);
            // console.log(postedObject);
            chrome.tabs.sendMessage(details.tabId, {action: postedObject.rating, message_id: postedObject.message_id});
        }
    },
    // filters
    {
        urls: ["https://chat.openai.com/backend-api/conversation*"],
        types: ["xmlhttprequest"]
    },
    ["requestBody"]
);
