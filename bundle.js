(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

function findAncestor (el, cls) {
    while ((el = el.parentElement) && !el.classList.contains(cls));
    return el;
}

const observer = new MutationObserver((mutations) => {
    // There are two types of copy buttons. The ones located inside messages that only copy parts of themm
    // like code snippets, and the ones located at the bottom of the chat that copy the whole message.
    // First le's add the event listener to the first type of buttons.
    const buttons = document.querySelectorAll('.flex.ml-auto.gizmo\\:ml-0.gap-1.items-center');
    buttons.forEach((button) => {
        // Check if the button already has the event listener
        if (!button.dataset.listenerAdded) {
            button.addEventListener('click', (event) => {
                var superParent = button.parentElement.parentElement;
                var singleParent = button.parentElement;
                var possibleChild = superParent.parentElement.querySelector('.text-message');
                var outputText;
                var copiedText;
                if (possibleChild) {
                    console.log(possibleChild);
                    copiedText = possibleChild.innerText;
                    console.log(copiedText);
                    outputText = possibleChild.innerText;
                } else {
                    copiedText = superParent.innerText;
                    copiedText = copiedText.replace(singleParent.innerText, '')
                    console.log(copiedText);
                    const ancestor = findAncestor(superParent, 'text-message');
                    outputText = ancestor ? ancestor.innerText : null;
                }

                chrome.storage.sync.get(['endUser', 'NEBULY_API_KEY'], function(result) {
                    const endUser = result.endUser;
                    const NEBULY_API_KEY = result.NEBULY_API_KEY;
                    const sdk = new NebulySdk(
                        NEBULY_API_KEY,
                        {
                            end_user: endUser,
                        }
                    );
                    if (outputText) {
                        sdk.sendAction({slug: "copy_output", text: copiedText}, {
                            output: outputText,
                        });
                    }
                
                });
            });
            // Mark the button as having the event listener
            button.dataset.listenerAdded = true;
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });
},{"@nebuly-ai/javascript":2}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NebulySdk = void 0;
class NebulySdk {
    constructor(apiKey, options) {
        this.apiKey = apiKey;
        this.options = options;
        this.sendAction = (action, metadata) => {
            metadata = Object.assign({ timestamp: new Date(), anonymize: true }, metadata);
            const payload = { action, metadata };
            return fetch(`${this.getOptions().baseUrl}/api/v1/events/feedback`, {
                method: "POST",
                body: JSON.stringify(payload),
                headers: { "Authorization": `Bearer ${this.apiKey}`, "Accept": "application/json", "Content-Type": "application/json" }
            });
        };
        this.observeChat = (options) => {
            const element = options.chatElement || document.body;
            const sdkOptions = this.getOptions();
            const { end_user, end_user_group_profile, anonymize } = sdkOptions;
            const copyListener = (e) => {
                var _a;
                let slug = null;
                let input = null;
                let output = null;
                if (!(e.target instanceof Element))
                    return;
                if (e.target.closest(options.userPromptSelector)) {
                    slug = "copy_input";
                    input = e.target.textContent;
                }
                if (e.target.closest(options.responseSelector)) {
                    slug = "copy_output";
                    output = e.target.textContent;
                }
                // The copy event is outside the input or output
                if (!slug)
                    return;
                // Capture copied text
                const text = (_a = window.getSelection()) === null || _a === void 0 ? void 0 : _a.toString();
                if (!text)
                    return;
                // Send action
                this.sendAction({ slug: slug, text }, { end_user, end_user_group_profile, input, output, timestamp: new Date(), anonymize });
            };
            const pasteListener = (e) => {
                var _a;
                if (!(e.target instanceof Element))
                    return;
                if (!e.target.closest(options.inputSelector))
                    return;
                const text = (_a = e.clipboardData) === null || _a === void 0 ? void 0 : _a.getData("text/plain");
                if (!text)
                    return;
                // Send action
                this.sendAction({ slug: "paste", text }, { end_user, end_user_group_profile, input: null, output: null, timestamp: new Date(), anonymize });
            };
            element.addEventListener("copy", copyListener);
            element.addEventListener("paste", pasteListener);
            return () => {
                element.removeEventListener("copy", copyListener);
                element.removeEventListener("paste", pasteListener);
            };
        };
    }
    getOptions() {
        return { baseUrl: "https://backend.nebuly.com/event-ingestion", anonymize: true, end_user_group_profile: null, ...this.options };
    }
}
exports.NebulySdk = NebulySdk;

},{}]},{},[1]);
