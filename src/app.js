import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import categoriaRouter from "./routers/categoriaRouter.js";
import jogoRouter from "./routers/jogoRouter.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(categoriaRouter);
app.use(jogoRouter);

app.listen(process.env.PORT, () =>
  console.log(`Servidor ouvindo em localhost:${process.env.PORT}`)
);
