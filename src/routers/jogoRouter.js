import { Router } from "express";
import { adicionarJogo, listarJogos } from "../controllers/jogoController.js";
import jogoValidationMiddleware from "../middlewares/jogoValidationMiddleware.js";

const jogoRouter = Router();

jogoRouter.post("/games", jogoValidationMiddleware, adicionarJogo);

jogoRouter.get("/games", listarJogos);

export default jogoRouter;
