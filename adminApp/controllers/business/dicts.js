import models from "../../../models/index.js";
import {createError, createResponse} from "../../../helpers/responser.js";

// Все роли
export const getAssistantRoles = async (req, res) => {
    const list = await models.AssistantRole.findAll();
    if (!list) return res.status(404).json(createError("Словарь не найден"))
    return res.status(200).json(createResponse(list))
}

// Все виджеты
export const getWidgets = async (req, res) => {
    const list = await models.Widget.findAll({attributes: ["code", "title"]});
    if (!list) return res.status(404).json(createError("Словарь не найден"))
    return res.status(200).json(createResponse(list))
}