import * as http from "https";
import "dotenv/config";

export const createUpdateAssistant = ({assistant_id = "", name, description, instructions, functions = []}) => new Promise(resolve => {
    const reqOptions = {
        host: process.env.OPENAI_HOST,
        method: "POST",
        post: 80,
        path: assistant_id ? encodeURI(`/v1/assistants/${assistant_id}`) : encodeURI(`/v1/assistants`),
        headers: {
            'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
        },
    }

    const body = {
        name, description, instructions,
        model: process.env.OPENAI_MODEL,
        temperature: 1,
        tools: [...functions]
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

    req.write(JSON.stringify(body));
    req.end();
})

