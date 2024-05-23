import {DataTypes} from "sequelize";
import "dotenv/config"
import {createUpdateAssistant} from "../services/gpt/assistants.js";

const getBusinessModel = sequelize => {
    const Business = sequelize.define('business', {
        title: DataTypes.STRING,
        avatar: DataTypes.STRING,
        backgroundImage: DataTypes.STRING,
        code: DataTypes.STRING,
        short_description: DataTypes.TEXT,
        description: DataTypes.TEXT,
        products: DataTypes.JSON, /* <name, description, price, priceCurrency, link, image */
        links: DataTypes.JSON,/* <name, description, link, image> */
        widgets: DataTypes.JSON,/* <code> */
        assistant_id: DataTypes.STRING,
        instagram: DataTypes.STRING,
        linkedIn: DataTypes.STRING,
        webSite: DataTypes.STRING,
        chatButtonLabel: DataTypes.STRING,
    })

    // Hash the user password before saving to the database
    Business.beforeCreate(async business => {
        const {id} = await createUpdateAssistant({name: "Консультант", description: "Помочь клиенту"})
        if (id) business.assistant_id = id;
    });

    Business.associate = models => {
        models.Business.belongsTo(models.User, {foreignKey: "user_id"});
        models.Business.belongsTo(models.AssistantRole, {foreignKey: "assistant_role_id"});
    }

    return Business;
}

export default getBusinessModel