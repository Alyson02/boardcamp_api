import { Router } from "express";
import {
  adicionarCategoria,
  listarCategorias,
} from "../controllers/categoriaController.js";
import categoriaValidationMiddleware from "../middlewares/categoriaValidationMiddleware.js";

const categoriaRouter = Router();

categoriaRouter.post(
  "/categoria",
  categoriaValidationMiddleware,
  adicionarCategoria
);

categoriaRouter.get("/categorias", listarCategorias);

export default categoriaRouter;
