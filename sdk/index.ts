export class NebulySdk {
    constructor(private apiKey: string, private options: NebulySdkOptions) { }

    sendAction = (action: Action, metadata?: FeedbackActionMetadata) => {
        metadata = Object.assign({ timestamp: new Date(), anonymize: true }, metadata)
        const payload: FeedbackAction = { action, metadata }
        console.log(payload)
        return fetch(`${this.getOptions().baseUrl}/api/v1/events/feedback`, {
            method: "POST",
            body: JSON.stringify(payload),
            headers: { "Authorization": `Bearer ${this.apiKey}`, "Accept": "application/json", "Content-Type": "application/json" }
        })
    }

    observeChat = (options: ObserveChatOptions) => {
        const element = options.chatElement || document.body
        const sdkOptions = this.getOptions()
        const { end_user, end_user_group_profile, anonymize } = sdkOptions

        const copyListener = (e: ClipboardEvent) => {
            let slug: "copy_input" | "copy_output" | null = null
            let input: string | null = null
            let output: string | null = null

            if (!(e.target instanceof Element)) return

            if (e.target.closest(options.userPromptSelector)) {
                slug = "copy_input"
                input = e.target.textContent
            }
            if (e.target.closest(options.responseSelector)) {
                slug = "copy_output"
                output = e.target.textContent
            }

            // The copy event is outside the input or output
            if (!slug) return

            // Capture copied text
            const text = window.getSelection()?.toString()
            if (!text) return

            // Send action
            this.sendAction({ slug: slug, text }, { end_user, end_user_group_profile, input, output, timestamp: new Date(), anonymize })
        }

        const pasteListener = (e: ClipboardEvent) => {
            if (!(e.target instanceof Element)) return
            if (!e.target.closest(options.inputSelector)) return

            const text = e.clipboardData?.getData("text/plain")
            if (!text) return

            // Send action
            this.sendAction({ slug: "paste", text }, { end_user, end_user_group_profile, input: null, output: null, timestamp: new Date(), anonymize })
        }


        element.addEventListener("copy", copyListener)
        element.addEventListener("paste", pasteListener)

        return () => {
            element.removeEventListener("copy", copyListener)
            element.removeEventListener("paste", pasteListener)
        }
    }

    private getOptions(): Required<NebulySdkOptions> {
        return { baseUrl: "https://dev.backend.nebuly.com/event-ingestion", anonymize: true, end_user_group_profile: null, ...this.options }
    }

}


interface FeedbackActionMetadata {
    input?: string | null;
    output?: string | null;
    end_user?: string;
    end_user_group_profile?: string | null;
    timestamp?: Date;
    anonymize?: boolean;
}

interface ThumbsUpFeedbackAction {
    slug: "thumbs_up";
}

interface ThumbsDownFeedbackAction {
    slug: "thumbs_down";
}

interface CopyInputFeedbackAction {
    slug: "copy_input";
    text: string;
}

interface CopyOutputFeedbackAction {
    slug: "copy_output";
    text: string;
}

interface PasteFeedbackAction {
    slug: "paste";
    text: string;
}

interface UserCommentAction {
    slug: "comment";
    text: string;
}

interface RegenerateAction {
    slug: "regenerate";
}

interface EditAction {
    slug: "edit";
    text: string;
}

type Action = ThumbsUpFeedbackAction | ThumbsDownFeedbackAction | CopyInputFeedbackAction | CopyOutputFeedbackAction | PasteFeedbackAction | UserCommentAction | RegenerateAction | EditAction

interface FeedbackAction {
    metadata: FeedbackActionMetadata;
    action: Action;
}

type NebulySdkOptions = {
    end_user: string;
    end_user_group_profile?: string | null;
    anonymize?: boolean;
    baseUrl?: string;
}


type ObserveChatOptions = {
    userPromptSelector: string
    responseSelector: string
    inputSelector: string
    chatElement?: HTMLElement
}