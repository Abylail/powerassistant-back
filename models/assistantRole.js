import {DataTypes} from "sequelize";
import "dotenv/config"

const getAssistantRoleModel = sequelize => {
    const AssistantRole = sequelize.define('assistantRole', {
        title: DataTypes.STRING,
        purpose: DataTypes.STRING,
    })

    return AssistantRole;
}

export default getAssistantRoleModel