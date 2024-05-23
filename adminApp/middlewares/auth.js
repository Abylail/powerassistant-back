import jwt from "jsonwebtoken";
import "dotenv/config"
import {createError} from "../../helpers/responser.js";
import {getCache} from "../../services/cache.js";

export default (req, res, next) => {
    const token = req.cookies.userToken;

    if (!token) return res.status(401).json(createError("Пользователь не авторизован"))

    const verifyToken = getCache(token);
    try {
        const decoded = jwt.verify(verifyToken, process.env.SECRET);
        req.user = decoded;
        return next();
    } catch (e) {
        return res.status(401).json(createError("Пользователь не авторизован"))
    }
}