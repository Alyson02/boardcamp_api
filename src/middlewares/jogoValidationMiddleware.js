import connectDB from "../db.js";
import jogoModel from "../models/jogoModel.js";

export default async function jogoValidationMiddleware(req, res, next) {
  try {
    const body = req.body;

    const { error } = jogoModel.validate(body);
    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(422).send(erros);
    }

    const db = await connectDB();
    const { rows } = await db.query(
      `
      SELECT * FROM games WHERE name = $1
    `,
      [body.name]
    );

    const { rows: categoriaRows } = await db.query(
      `
      SELECT * FROM categories WHERE id = $1
    `,
      [body.categoryId]
    );

    if (rows.length > 0 || categoriaRows.length === 0)
      return res.sendStatus(409);

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno");
  }
}
