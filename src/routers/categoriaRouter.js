import { Router } from "express";
import {
  adicionarCategoria,
  listarCategorias,
} from "../controllers/categoriaController.js";
import categoriaValidationMiddleware from "../middlewares/categoriaValidationMiddleware.js";

const categoriaRouter = Router();

categoriaRouter.post(
  "/categories",
  categoriaValidationMiddleware,
  adicionarCategoria
);

categoriaRouter.get("/categories", listarCategorias);

export default categoriaRouter;
