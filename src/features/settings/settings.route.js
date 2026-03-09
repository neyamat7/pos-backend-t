import express from "express";
import {
  getCratePricesController,
  updateCratePricesController,
} from "./settings.controller.js";

const routes = express.Router();

routes.get("/crate-prices", getCratePricesController);
routes.put("/crate-prices/update", updateCratePricesController);
routes.post("/crate-prices/update", updateCratePricesController);

export default routes;
