import * as http from "https";
import "dotenv/config";

export const sendSmsService = (phone, text) => new Promise(resolve => {
    const reqOptions = {
        host: process.env.SMS_SERVICE_HOST,
        method: "GET",
        post: 80,
        path: encodeURI(`/service/message/sendsmsmessage?recipient=${phone}&text=${text}&apiKey=${process.env.SMS_SERVICE_KEY}`),
    }

    const req = http.request(reqOptions, r => {
        r.setEncoding("utf8");
        r.on("data", () => resolve(true))
    });

    req.on("error", (e) => resolve(false));

    req.end();
})