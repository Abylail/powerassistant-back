// Получить информацию бизнеса
import models from "../../models/index.js";
import {createError, createResponse} from "../../helpers/responser.js";

export const getInfo = async (req, res) => {
    const {code} = req.params;
    const business = await models.Business.findOne({
        where: {code},
        attributes: {exclude: ["id", "createdAt", "updatedAt", "user_id", "assistant_id", "assistant_role_id"]},
    });
    if (!business) return res.status(404).json(createError("Не найдено"));
    return res.status(200).json(createResponse(business));
}