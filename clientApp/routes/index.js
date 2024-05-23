import "dotenv/config";

import createBusinessRoutes from "./business.js";

export default app => {
    const BaseUrl = "/api/v1";

    app.use(`${BaseUrl}/business`, createBusinessRoutes(app))
}