import jwt from "jsonwebtoken";
import "dotenv/config";

export const generateToken = (object = {}) => {
    return jwt.sign(object,  process.env.SECRET, { expiresIn: '24h' });
}

export const decodeToken = token => {
    let decoded = null;
    try {
        decoded = jwt.verify(token, process.env.SECRET);
    } catch (e) {

    }

    return decoded
}