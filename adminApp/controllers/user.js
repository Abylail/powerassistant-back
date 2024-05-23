import models from "../../models/index.js";
import {createError, createResponse} from "../../helpers/responser.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import {generateToken} from "../../helpers/generateAccessToken.js";
import {getCache, setCache} from "../../services/cache.js";
import generateRandomHash from "../../helpers/generateRandomHash.js";
import {sendSmsService} from "../../services/sendSms.js";

const generateAccessToken = (user_id) => {
    return jwt.sign({ id: user_id },  process.env.SECRET, { expiresIn: '48h' });
};

export const login = async (req, res) => {
    const {phone, password} = req.body;
    const user = await models.User.findOne({
        where: { phone },
        attributes: {exclude: ["updatedAt", "createdAt"]},
    });

    if (!user) return res.status(404).json(createError("Пользователь не найден"))

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) return res.status(500).json(createError("Неверный логин или пароль"))

    const token = generateToken({id: user.id, role: user.role, business_id: user.business_id}) || generateAccessToken(user.id);
    const userToken = generateRandomHash(20);

    setCache(userToken, token);

    res.status(200).json(createResponse({...user.dataValues, password: undefined, token: userToken} ));
}

// Генерация случайных 4 чисел
const generateSmsCode = () => Math.floor(1000 + Math.random() * 9000);

// Отправка кода
export const sendOtp = async (req, res) => {
    const {phone} = req.body;

    if (!phone || phone.length !== 11) return res.status(500).json(createError("Телефон не соотвествует формату"))

    const smsCode = generateSmsCode();
    setCache(`otp-${phone}`, smsCode);

    if (process.env.PROCESS_TYPE !== "test") {
        await sendSmsService(phone, `Power Assistant - ваш код: ${smsCode}`)
        return res.status(200).json({status: "OK"});
    }

    return res.status(200).json(createResponse({status: "OK", otp: smsCode}));
}

// Проверить смс код
export const checkOtp = async (req, res) => {
    const {phone, otp} = req.body;
    const realOtp = getCache(`otp-${phone}`);
    if (!realOtp || otp.toString() !== realOtp.toString()) return res.status(500).json(createError("Не верный смс код"));
    return res.status(200).json({status: "OK"})
}

export const resetPass = async (req, res) => {
    const {phone, password, otp} = req.body;
    if (!phone || !password || !otp) return res.status(500).json(createError("Не хватает аргументов"))
    const realOtp = getCache(`otp-${phone}`);
    if (!realOtp || otp.toString() !== realOtp.toString()) return res.status(500).json(createError("Не верный смс код"));
    try {
        await models.User.update({password: await bcrypt.hash(password, 10)}, {where: {phone}})
    } catch (e) {
        console.log(e);
        return res.status(500).json(createError("Ошибка при смене пароля"))
    }

    return res.status(200).json({status: "OK"})
}

export const registration = async (req, res) => {
    const {first_name, last_name, phone, password, otp} = req.body;

    const realOtp = getCache(`otp-${phone}`);
    if (!realOtp || otp.toString() !== realOtp.toString()) return res.status(500).json(createError("Не верный смс код"));

    const user = await models.User.findOne({ where: { phone } })

    if (user) return res.status(500).json(createError("Пользователь существует"));
    if (!first_name || !phone || !password) return res.status(500).json(createError("Не хватает аргументов"));

    try {
        await models.User.create({
            first_name,
            last_name,
            phone,
            password,
            role: "BUSINESS",
        })
    } catch (e) {
        return res.status(500).json(createError("Не могу создать пользователя"));
    }

    let newUser = await models.User.findOne({
        where: { phone },
        attributes: {exclude: ["updatedAt", "createdAt", "password"]}
    });

    try {
        await models.Business.create({user_id: newUser.dataValues.id});
        const newBusiness = await models.Business.findOne({where: {user_id: newUser.dataValues.id}});
        await models.User.update({business_id: newBusiness.dataValues.id}, {where: { phone }})
    } catch (e) {
        return res.status(500).json(createError("Не могу создать бизнес"));
    }

    newUser = await models.User.findOne({
        where: { phone },
        attributes: {exclude: ["updatedAt", "createdAt", "password"]}
    });

    return res.status(200).json(createResponse(newUser));
}

export const tokenAuth = async (req, res) => {
    const { id } = req.user;
    const user = await models.User.findOne({
        where: { id },
        attributes: {exclude: ["updatedAt", "createdAt", "id", "password"]},
    });

    if (!user) return res.status(401).json(createError("Пользователь не авторизован"));

    res.status(200).json(createResponse(user));
}

export const update = async (req, res) => {
    const { id } = req.user;
    const oldUser = await models.User.findOne({
        where: { id },
        attributes: {exclude: ["updatedAt", "createdAt", "id", "password"]}
    });

    const updateData = req.body;
    const dataForUpdate = {
        first_name: updateData.first_name || oldUser.dataValues.first_name,
        last_name: updateData.last_name || oldUser.dataValues.last_name,
    }
    try {
        await models.User.update(dataForUpdate, {where: {id}})
    } catch (e) {
        return res.status(500).json(createError("Не могу обновить пользователя"))
    }

    res.status(200).json(createResponse({...oldUser.dataValues, ...dataForUpdate}));
}

// Зарегесрирован ли пользователь
export const isRegistered = async (req, res) => {
    const { phone } = req.query;
    return res.status(200).json(createResponse({registered: !!(await models.User.findOne({where: {phone}}))}))
}
