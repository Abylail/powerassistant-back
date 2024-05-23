import express from "express";
import {getAssistantRoles, getWidgets} from "../../controllers/business/dicts.js";



export default () => {
    const router = express.Router();

    router.get("/assistantRole", getAssistantRoles);
    router.get("/widget", getWidgets);

    return router;
}