chrome.storage.sync.get(['endUser', 'NEBULY_API_KEY'], function(result) {
    const endUser = result.endUser;
    const NEBULY_API_KEY = result.NEBULY_API_KEY;
    async function postData() {
        // wait 1s to be sure that the chat is loaded
        const timeStart = new Date();
        await new Promise(r => setTimeout(r, 1000));
        let elements = document.getElementsByClassName('text-message');
        let tuples = [];
        for (let i = 0; i < elements.length; i++) {
            if (elements[i].dataset.messageAuthorRole === "user") {
                // If the next element exists and its role is "assistant", add a tuple to the array
                if (i + 1 < elements.length && elements[i + 1].dataset.messageAuthorRole === "assistant") {
                    // check if the assistant message is already finished
                    if (i + 1 == elements.length - 1) {
                        let assistantMessage = elements[i + 1].textContent;
                        let iteration = 0;
                        await new Promise(r => setTimeout(r, 1000));
                        while (assistantMessage !== elements[i + 1].textContent) {
                            assistantMessage = elements[i + 1].textContent;
                            await new Promise(r => setTimeout(r, 1000));
                            if (iteration > 60) {
                                break;
                            }
                            iteration++;
                        }
                    }
                    tuples.push([elements[i].textContent, elements[i + 1].textContent]);
                }
            }
        }
        const history = tuples.slice(0, tuples.length -1);
        const input = tuples[tuples.length - 1][0];
        const output = tuples[tuples.length - 1][1];
        const timeEnd = new Date();
        const response = await fetch("https://backend.nebuly.com/event-ingestion/api/v1/events/interactions", {
            method: "POST",
            body: JSON.stringify({
                interaction: {
                    input: input,
                    output: output,
                    time_start: timeStart.toISOString(),
                    time_end: timeEnd.toISOString(),
                    history: history,
                    end_user: endUser,
                    model: "gpt-3.5-turbo",
                },
                anonymize: true,
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${NEBULY_API_KEY}`
            }
        })
    
        // console.log(await response.json())
        // console.log(input)
        // console.log(output)
    }
    postData();
});
