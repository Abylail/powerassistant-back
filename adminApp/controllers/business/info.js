import models from "../../../models/index.js";
import {createError, createResponse} from "../../../helpers/responser.js";
import {createUpdateAssistant} from "../../../services/gpt/assistants.js";
import {removeFile, uploadFile} from "../../../services/image.js";

const createProducts = products => {
    return "\n\nПродукты: " + products.map(({name, description, price, priceCurrency, link}) => {
        let product = `${name} описание ${description}`

        if (price) product += `цена ${price}${priceCurrency}`;

        if (link) product += ` ссылка ${link}`;

        return product;
    }).join(",\n") + ". ";
}

const createLinks = links => {
    if (!links || !links.length) return ""
    return "\n\nСсылки: " + links.map(({name, description, link}) => {
        let linkText = `[${link}] описание ${name} ${description || ""}`

        return linkText;
    }).join(",\n") + ". ";
}

// Создать функции для AI
const createFunctions = async widgets => {
    if (!Array.isArray(widgets) || !widgets.length) return [];
    const _widgets = await models.Widget.findAll({where: {code: widgets}});
    let tools = [];
    _widgets.forEach(wid => {
        if (Array.isArray(wid.dataValues.functionJson)) {
            wid.dataValues.functionJson.forEach(functionJson => tools.push({
                type: "function",
                function: functionJson
            }))
        }
    });
    return tools;
}

// Создать инструкции для AI
const createInstructions = ({
                                business_name = "",
                                business_description = "",
                                short_business_description = "",
                                products = null,
                                links = null,
                                assistant_purpose = "",
                                assistant_role = ""
}) => {
    let _instructions = "";

    if (assistant_role) _instructions += `Ты: {${assistant_role} в компании ${business_name}}`

    if (assistant_purpose) _instructions += `\nТвоя цель: {${assistant_purpose}. }`;

    if (short_business_description || business_description) _instructions += `\n\nИнформация о бизнесе: {${short_business_description}. ${business_description}}`;

    if (products && Array.isArray(products)) _instructions += createProducts(products);

    if (links && Array.isArray(links)) _instructions += createLinks(links);

    _instructions += "\n\nОтвечай небольшими сообщениями."

    return _instructions;
}

const prepareLinks = async links => {
    let _links = Array.isArray(links) ? links.slice() : [];
    return await Promise.all(_links.map(async l => {
        let _link = {...l};
        if (_link.imageBuffer) {
            if (_link.imageUrl) await removeFile(_link.imageUrl);
            _link.imageUrl = await uploadFile(_link.imageBuffer, "link");
            delete _link.imageBuffer;
        }
        return _link
    }))
}

const prepareProducts = async products => {
    let _products = Array.isArray(products) ? products.slice() : [];
    return await Promise.all(_products.map(async p => {
        let _product = {...p};
        if (_product.imageBuffer) {
            if (_product.imageUrl) await removeFile(_product.imageUrl);
            _product.imageUrl = await uploadFile(_product.imageBuffer, "product");
            delete _product.imageBuffer;
        }
        return _product
    }))
}

const prepareBusinessJson = async info => {
    const {products, links} = info;

    let _prepared = {
        ...info,
        products: await prepareProducts(products),
        links: await prepareLinks(links),
    }

    if (info.avatarBuffer) {
        if (info.avatar) await removeFile(info.avatar);
        _prepared.avatar = await uploadFile(info.avatarBuffer, "avatar");
        delete info.avatarBuffer;
    }

    if (info.backgroundImageBuffer) {
        if (info.backgroundImage) await removeFile(info.backgroundImage);
        _prepared.backgroundImage = await uploadFile(info.backgroundImageBuffer, "background");
        delete info.backgroundImage;
    }

    return _prepared;
}

// Получить информацию бизнеса
export const getInfo = async (req, res) => {
    const {business_id} = req.user;
    const business = await models.Business.findByPk(business_id, {
        attributes: {exclude: ["id", "createdAt", "updatedAt", "user_id", "assistant_id"]},
        include: {
            model: models.AssistantRole,
            as: "assistantRole"
        }
    });
    return res.status(200).json(createResponse(business));
}

// Обновить информацию бизнеса
export const updateInfo = async (req, res) => {
    const {business_id} = req.user;
    const businessData = req.body || {};

    try {
        await models.Business.update(await prepareBusinessJson(businessData), {where: {id: business_id}});
    } catch (e) {
        console.log(e);
        return res.status(500).json(createError("Не могу обновить"));
    }


    const business = await models.Business.findByPk(business_id, {
        attributes: {exclude: ["id", "createdAt", "updatedAt", "user_id"]},
        include: {
            model: models.AssistantRole,
            as: "assistantRole"
        }
    });

    // Обновляю ассистента
    try {
        await createUpdateAssistant({
            assistant_id: business.dataValues.assistant_id,
            name: `${business.dataValues.assistantRole?.title || ""} ${business.dataValues.title}`,
            description: business.dataValues.assistant_purpose,
            functions: await createFunctions(business.dataValues.widgets),
            instructions: createInstructions({
                business_name: business.dataValues.title,
                short_business_description: business.dataValues.short_description,
                business_description: business.dataValues.description,
                products: business.dataValues.products,
                assistant_purpose: business.dataValues.assistantRole?.purpose,
                assistant_role: business.dataValues.assistantRole?.title,
                links: business.dataValues.links
            })
        })
    } catch (e) {
        console.log(e);
        return res.status(500).json(createError("Не могу обновить"));
    }

    return res.status(200).json(createResponse(business));
}