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

function camelToSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (sender.id === chrome.runtime.id && request.action && request.message_id) {
            console.log(request.action);  // logs the action
            console.log(request.message_id);  // logs the message_id

            chrome.storage.sync.get(['endUser', 'NEBULY_API_KEY'], function(result) {
                const endUser = result.endUser;
                const NEBULY_API_KEY = result.NEBULY_API_KEY;
                let sdk = new NebulySdk(
                    NEBULY_API_KEY,
                    {
                        end_user: endUser,
                    }
                );
                
                const messages = Array.from(document.querySelectorAll('.text-message'));
                const output_message = messages.find(message => message.dataset.messageId === request.message_id);
                const output_index = messages.indexOf(output_message);
                const input_message = output_index > 0 ? messages[output_index - 1] : null;

                const output_text = output_message ? output_message.textContent : "";                
                const input_text = input_message ? input_message.textContent : "";

                let actionInSnakeCase = camelToSnakeCase(request.action);
                sdk.sendAction({slug: actionInSnakeCase}, {
                    output: output_text,
                    input: input_text
                })
            });
        }
    }
);