import { Router } from "express";
import {
  adicionarCliente,
  atualizarCliente,
  clientePorId,
  listarClientes,
} from "../controllers/clienteController.js";

import clienteValidationMiddleware from "../middlewares/clienteValidationMiddleware.js";

const clienteRouter = Router();

clienteRouter.post("/customers", clienteValidationMiddleware, adicionarCliente);

clienteRouter.get("/customers", listarClientes);

clienteRouter.get("/customers/:id", clientePorId);

clienteRouter.put(
  "/customers/:id",
  clienteValidationMiddleware,
  atualizarCliente
);

export default clienteRouter;
