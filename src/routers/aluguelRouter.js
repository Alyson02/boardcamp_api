import { Router } from "express";
import {
  adicionarAluguel,
  deletarAluguel,
  finalizarAluguel,
  listarAlugueis,
} from "../controllers/aluguelController.js";
import aluguelValidationMiddleware from "../middlewares/aluguelValidationMiddleware.js";

const aluguelRouter = Router();

aluguelRouter.get("/rentals", listarAlugueis);

aluguelRouter.post("/rentals", aluguelValidationMiddleware, adicionarAluguel);

aluguelRouter.post("/rentals/:id/return", finalizarAluguel);

aluguelRouter.delete("/rentals/:id", deletarAluguel);

export default aluguelRouter;
