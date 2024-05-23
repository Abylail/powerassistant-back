import express from "express";

import {
    checkOtp,
    isRegistered,
    login,
    registration,
    resetPass,
    sendOtp,
    tokenAuth,
    update
} from "../controllers/user.js";
import auth from "../middlewares/auth.js";

export default () => {
    const router = express.Router();

    router.get("/login/token", auth, tokenAuth)
    router.post("/login", login)
    router.post("/registration", registration)
    router.post("/reset", resetPass)
    router.post("/otp/send", sendOtp)
    router.post("/otp/check", checkOtp)
    router.put("/update", auth, update)
    router.get("/registered", isRegistered)

    return router;
}