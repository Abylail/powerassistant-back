import "dotenv/config";

import createUserRoutes from "./user.js";
import createUsersRoutes from "./admin/users.js";
import createBusinessInfoRoutes from "./business/info.js";
import createDictRoutes from "./business/dicts.js";
import cache from "../../clientApp/middlewares/cache.js";

export default app => {
    const BaseUrl = "/api/v1/admin";

    app.use(`${BaseUrl}/user`, createUserRoutes(app))
    app.use(`${BaseUrl}/users`, createUsersRoutes(app))
    app.use(`${BaseUrl}/business/info`, createBusinessInfoRoutes(app))
    app.use(`${BaseUrl}/business/dict`, cache(1), createDictRoutes(app))
}