var NebulySdk = require('@nebuly-ai/javascript').NebulySdk;

// Create a new instance of the SD
let removeNebulyListeners;

chrome.storage.sync.get(['endUser', 'NEBULY_API_KEY'], function(result) {
    const endUser = result.endUser;
    const NEBULY_API_KEY = result.NEBULY_API_KEY;
    const sdk = new NebulySdk(
        NEBULY_API_KEY,
        {
            end_user: endUser,
        }
    );

    if (typeof removeNebulyListeners === 'function') {
        removeNebulyListeners();
    }
    // const chatBox = document.getElementsByClassName('text-sm')[0];

    removeNebulyListeners = sdk.observeChat({
        // chatElement: chatBox,
        // CSS Selectors to determine the kind of element
        // the user is interacting with
        userPromptSelector: '.text-message[data-message-author-role="user"]',
        responseSelector: '.text-message[data-message-author-role="assistant"]',        
        inputSelector: '.gizmo textarea'
    });
});
