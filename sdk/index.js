window.NebulySdk = class NebulySdk {
    constructor(apiKey, options) {
        this.apiKey = apiKey;
        this.options = options;
        this.sendAction = (action, metadata) => {
            metadata = Object.assign({ timestamp: new Date(), anonymize: true }, metadata);
            const payload = { action, metadata };
            console.log(payload);
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
        return { baseUrl: "https://dev.backend.nebuly.com/event-ingestion", anonymize: true, end_user_group_profile: null, ...this.options };
    }
}
