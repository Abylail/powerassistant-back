// Получить информацию бизнеса
import models from "../../models/index.js";
import {createError, createResponse} from "../../helpers/responser.js";
import {initChat, sendMessage, submitWidgetMessage} from "../../services/gpt/thread.js";
import {getCache, setCache} from "../../services/cache.js";
import generateRandomHash from "../../helpers/generateRandomHash.js";

const getBusinessAssistantId = async (code) => {
    if (!code) return null
    const _assId = getCache(`assistant-${code}`);
    if (_assId) return _assId;
    const business = await models.Business.findOne({
        where: {code},
        attributes: ["assistant_id"],
    });

    if (!business?.assistant_id) return null

    setCache(`assistant-${code}`, business.assistant_id);

    return business.assistant_id;
}

export const message = async (req, res) => {
    const {code} = req.params;
    const {message, chat_id} = req.body;
    if (!code || !message) return res.status(500).json(createError("Не хватает аргументов"));

    const assistantId = await getBusinessAssistantId(code);
    if (!assistantId) return res.status(404).json(createError("Чат не найден"));

    let threadId = chat_id && getCache(`chat-${chat_id}`) || null;

    const chatId = chat_id || generateRandomHash();

    if (!threadId) {
        const threadResponse = await initChat(message);
        setCache(`chat-${chatId}`, threadResponse.threadId);
        threadId = threadResponse.threadId;
    }

    const answer = await sendMessage(threadId, assistantId, message);

    return res.status(200).json(createResponse({chatId, ...answer}));
}

export const submitWidget = async (req, res) => {
    const {code} = req.params;
    const {form, chat_id} = req.body;
    if (!code || !chat_id) return res.status(500).json(createError("Не хватает аргументов"));

    const assistantId = await getBusinessAssistantId(code);
    const threadId = getCache(`chat-${chat_id}`);
    if (!assistantId || !threadId) return res.status(404).json(createError("Чат не найден"));

    const answer = await submitWidgetMessage(threadId, assistantId, form);

    return res.status(200).json(createResponse({chatId: chat_id, ...answer}));
}