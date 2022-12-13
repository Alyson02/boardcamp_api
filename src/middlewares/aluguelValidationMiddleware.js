import connectDB from "../db.js";
import aluguelModel from "../models/aluguelModel.js";

export default async function aluguelValidationMiddleware(req, res, next) {
  try {
    const body = req.body;
    const { id } = req.params;

    const { error } = aluguelModel.validate(body, { abortEarly: false });
    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(422).send(erros);
    }

    const db = await connectDB();

    let query = `SELECT * FROM customers WHERE id = $1`;
    const { rows } = await db.query(query, [body.customerId]);

    let queryGames = `SELECT * FROM games WHERE id = $1`;
    const { rows: gamesRows } = await db.query(queryGames, [body.gameId]);

    console.log(req.body);

    if (rows.length === 0 || gamesRows.length === 0) return res.sendStatus(400);

    const { rows: alugueisJogo } = await db.query(
      `SELECT r.* FROM rentals r JOIN games g on r."gameId" = g.id where r."gameId" = $1 and r."returnDate" IS NULL`,
      [body.gameId]
    );
    if (alugueisJogo.length === gamesRows[0].stockTotal) {
      return res.send("Aluguel não disponivel").status(400);
    }

    res.locals.pricePerDay = gamesRows[0].pricePerDay;

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno");
  }
}
