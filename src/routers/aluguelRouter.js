import { Router } from "express";
import {
  adicionarAluguel,
  deletarAluguel,
  finalizarAluguel,
  listarAlugueis,
  metricas,
} from "../controllers/aluguelController.js";
import aluguelValidationMiddleware from "../middlewares/aluguelValidationMiddleware.js";

const aluguelRouter = Router();

aluguelRouter.get("/rentals", listarAlugueis);

aluguelRouter.post("/rentals", aluguelValidationMiddleware, adicionarAluguel);

aluguelRouter.post("/rentals/:id/return", finalizarAluguel);

aluguelRouter.delete("/rentals/:id", deletarAluguel);

aluguelRouter.get("/rentals/metrics", metricas);

export default aluguelRouter;
