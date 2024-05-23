import NodeCache from "node-cache";
const myCache = new NodeCache();
import "dotenv/config"

export const getCache = (cacheId) => myCache.get(cacheId);


export const setCache = (cacheId, token) => {
    myCache.set(cacheId, token, 24 * 3600);
}