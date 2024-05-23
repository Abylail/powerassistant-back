import models, { sequelize } from "./models/index.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import express from "express";
import "dotenv/config";

import createAdminRouter from "./adminApp/routes/index.js"
import createClientRouter from "./clientApp/routes/index.js"

export default () => {
    const app = express();

    app.use(express.json({
        limit: '500mb'
    }));
    app.use(express.urlencoded({
        extended: true,
        limit: '500mb'
    }));
    app.use(cors({
        origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1', 'https://kidup.kz'],
        credentials: true,
        preflightContinue: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH' , 'DELETE', 'OPTIONS'],
    }))
    app.use(cookieParser())

    sequelize.sync({
        force: false,
        logging: false,
    }).then(() => {
        createAdminRouter(app);
        createClientRouter(app);
    })

    app.listen(process.env.PORT || 3333, () => {
        console.log("Server listen to port " + process.env.PORT || 3333)
    })
}