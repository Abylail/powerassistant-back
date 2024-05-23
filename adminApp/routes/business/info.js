import express from "express";
import auth from "../../middlewares/auth.js";
import {getInfo, updateInfo} from "../../controllers/business/info.js";



export default () => {
    const router = express.Router();

    router.get("/get", auth, getInfo);
    router.put("/update", auth, updateInfo);

    return router;
}