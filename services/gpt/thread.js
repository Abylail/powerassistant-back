import * as http from "https";
import "dotenv/config";
import {getCache, setCache} from "../cache.js";

const sendToThreadApi = ({path = '/v1/threads', body = null, method = "POST"}) => new Promise(resolve => {
    const reqOptions = {
        host: process.env.OPENAI_HOST,
        method,
        post: 80,
        path: encodeURI(path),
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'Content-Type': 'application/json',
            'OpenAI-Beta': 'assistants=v2'
        },
    }

    const req = http.request(reqOptions, r => {
        let data = "";

        r.setEncoding("utf8");
        r.on("data", (chunk) => {
            data += chunk;
        })

        r.on("end", () => {
            resolve(JSON.parse(data));
        })
    });

    req.on("error", (e) => {
        resolve({})
    });

    if (body) req.write(JSON.stringify(body));
    req.end();
})

// Инициализация чата
export const initChat = async () => {
    const newThread = await sendToThreadApi({});
    return {threadId: newThread.id};
}

export const runEnd = (threadId, runId) => new Promise(async resolve => {
    const _run = await sendToThreadApi({path: `/v1/threads/${threadId}/runs/${runId}`, method: "GET"});
    const loadingStatuses = ["queued", "in_progress", "cancelling"]; //requires_action
    if (!loadingStatuses.includes(_run.status)) return resolve(_run);
    setTimeout( async() => {
        const nextRun = await runEnd(threadId, runId);
        resolve(nextRun);
    }, 200)
})

// Отправка сообщение {message, widget}
export const sendMessage = async (threadId, assistantId, clientMessage) => {
    await sendToThreadApi({path: `/v1/threads/${threadId}/messages`, body: {
        role: "user",
        content: clientMessage
    }});

    const run = await sendToThreadApi({path: `/v1/threads/${threadId}/runs`, body: {
        assistant_id: assistantId,
    }})

    setCache(`last-run-${threadId}`, run.id);

    // Жду run
    const runData = await runEnd(threadId, run.id);

    if (runData.status === "requires_action") {
        const toolInfo = runData.required_action?.submit_tool_outputs?.tool_calls[0];
        setCache(`tool-id-${threadId}`, toolInfo.id);
        return {widget: toolInfo.function};
    }

    // Беру ответное сообщение
    const _message = await sendToThreadApi({path: `/v1/threads/${threadId}/messages?run_id=${run.id}`, method: "GET"});
    const _content = _message.data?.[0]?.content?.[0];

    return {message: _content?.text?.value, _content};
}

// Отправка данных виджета
export const submitWidgetMessage = async (threadId, assistantId, widget = null) => {
    const lastRunId = getCache(`last-run-${threadId}`);
    const toolId = getCache(`tool-id-${threadId}`);

    await sendToThreadApi({path: `/v1/threads/${threadId}/runs/${lastRunId}/submit_tool_output`, method: "POST", body: {
            tool_outputs: [
                {
                    tool_call_id: toolId,
                    output: !!widget
                }
            ]
        }});

    // Жду run
    const runData = await runEnd(threadId, lastRunId);
    if (runData.status === "requires_action") {
        const toolInfo = runData.required_action?.submit_tool_outputs?.tool_calls[0];
        setCache(`tool-id-${threadId}`, toolInfo.id);
        return {message: "Тут открывается форма", widget: toolInfo.function};
    }

    // Беру ответное сообщение
    const _message = await sendToThreadApi({path: `/v1/threads/${threadId}/messages?run_id=${lastRunId}`, method: "GET"});
    const _content = _message.data?.[0]?.content?.[0];

    return {message: _content?.text?.value};
}

