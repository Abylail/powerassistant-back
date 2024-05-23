import {DataTypes} from "sequelize";
import "dotenv/config"

const getWidgetModel = sequelize => {
    const Widget = sequelize.define('widget', {
        title: DataTypes.STRING,
        code: DataTypes.STRING,
        functionJson: DataTypes.JSON,
    })

    return Widget;
}

export default getWidgetModel