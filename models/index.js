import {Sequelize, Op} from "sequelize";
import 'dotenv/config';

import getUserModel from "./user.js";
import getBusinessModel from "./business.js";
import gerAssistantRoleModel from "./assistantRole.js";
import getWidgetModel from "./widgets.js";

const sequelize = new Sequelize(process.env.DATABASE, process.env.DATABASE_USER, process.env.DATABASE_PASSWORD, {
    dialect: process.env.DATABASE_DIALECT,
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    operatorsAliases: {
        $like: Op.like,
    },
    logging: false
});

const models = {
    User: getUserModel(sequelize),
    Business: getBusinessModel(sequelize),
    AssistantRole: gerAssistantRoleModel(sequelize),
    Widget: getWidgetModel(sequelize),
}

for (const modelKey in models) {
    if (typeof models[modelKey]?.associate === 'function') models[modelKey]?.associate(models);
}

export {sequelize};

export default models;