import connectDB from "../db.js";
import categoriaModel from "../models/categoriaModel.js";

export default async function categoriaValidationMiddleware(req, res, next) {
  try {
    const body = req.body;

    const { error } = categoriaModel.validate(body);
    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(422).send(erros);
    }

    const db = await connectDB();
    const { rows } = await db.query(
      `
      SELECT * FROM categories WHERE name = $1
    `,
      [body.name]
    );

    if (rows.length > 0) return res.sendStatus(409);

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno");
  }
}
