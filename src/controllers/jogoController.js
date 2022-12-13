import connectDB from "../db.js";

export async function adicionarJogo(req, res) {
  try {
    const body = req.body;

    const db = await connectDB();
    await db.query(
      `
        INSERT INTO games VALUES(default, $1, $2, $3, $4, $5)
    `,
      [
        body.name,
        body.image,
        body.stockTotal,
        body.categoryId,
        body.pricePerDay,
      ]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Erro interno");
  }
}

export async function listarJogos(req, res) {
  try {
    const db = await connectDB();
    const { name } = req.query;
    let rows;

    let query = ` SELECT 
                    g.*, c.name as "categoryName", COUNT(r."gameId") as rentalsCount 
                  FROM games g 
                  JOIN categories c on g."categoryId" = c.Id
                  JOIN rentals r on g.id = r."gameId" GROUP BY r."gameId", g.id, c.name`;
    if (name) {
      query += ` HAVING g.name like $1`;
      rows = (await db.query(query, [`${name}%`])).rows;
    } else {
      rows = (await db.query(query)).rows;
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}
