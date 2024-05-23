import NodeCache from "node-cache";
const myCache = new NodeCache();
import "dotenv/config"

// duration - время жизни кэша в часах
export default (duration) => (req, res, next) => {
    if (process.env.PROCESS_TYPE === 'test' || req.method !== "GET") return next();

    const cachedResponse = myCache.get(req.originalUrl)
    if (cachedResponse) return res.send(JSON.parse(cachedResponse));

    res.originalSend = res.send;
    res.send = body => {
        res.originalSend(body);
        myCache.set(req.originalUrl, body, duration * 3600)
    }
    next()
}