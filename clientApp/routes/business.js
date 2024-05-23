import express from "express";
import {getInfo} from "../controllers/business.js";
import cache from "../middlewares/cache.js";
import {message, submitWidget} from "../controllers/businessChat.js";



export default () => {
    const router = express.Router();

    router.get("/get/:code", /*cache(1), */getInfo);

    router.post("/chat/:code", message)
    router.post("/chat/:code/submitWidget", submitWidget)

    return router;
}