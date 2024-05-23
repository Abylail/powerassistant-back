import express from "express";
import {getList, deleteUser, createUser} from "../../controllers/users.js";
import auth from "../../middlewares/auth.js";

export default () => {
    const router = express.Router();

    router.get("/get", auth, getList)
    router.delete("/delete/:id", auth, deleteUser)
    router.post("/create", auth, createUser)

    return router;
}