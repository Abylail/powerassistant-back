import models from "../../models/index.js";
import {createError, createResponse} from "../../helpers/responser.js";

export const getList = async (req, res) => {
    const query = req.query;

    const users = await models.User.findAll({where: query, attributes: {exclude: ["updatedAt", "createdAt", "password"]}});

    res.status(200).json(createResponse(users));
}

export const createUser = async (req, res) => {
    const {first_name, last_name, phone, password, role} = req.body;

    const user = await models.User.findOne({ where: { phone } })

    if (user) return res.status(500).json(createError("Пользователь существует"));
    if (!first_name || !phone || !password || !role) res.status(500).json(createError("Не хватает аргументов"));

    try {
        await models.User.create({
            first_name,
            last_name,
            phone,
            password,
            role,
        })
    } catch (e) {
        return res.status(500).json(createError("Не могу создать пользователя"));
    }

    const newUser = await models.User.findOne({
        where: { phone },
        attributes: {exclude: ["updatedAt", "createdAt", "password"]}
    });

    res.status(200).json(createResponse(newUser));
}

export const deleteUser = async (req, res) => {
    const {id} = req.params;

    try {
        await models.User.destroy({where: {id}})
    } catch (e) {
        res.status(500).json(createError("Удалить пользователя"));
    }

    res.status(200).json({ status: "OK" });
}