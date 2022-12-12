import connectDB from "../db.js";

export async function adicionarAluguel(req, res) {
  try {
    const body = req.body;
    const rentDate = new Date();
    const returnDate = null;
    const delayFee = null;
    const originalPrice = body.daysRented * res.locals.pricePerDay;

    const db = await connectDB();
    await db.query(
      `
        INSERT INTO rentals VALUES(default, $1, $2, $3, $4, $5, $6, $7)
    `,
      [
        body.customerId,
        body.gameId,
        rentDate,
        body.daysRented,
        returnDate,
        originalPrice,
        delayFee,
      ]
    );

    res.sendStatus(201);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}

export async function listarAlugueis(req, res) {
  try {
    const db = await connectDB();
    const { gameId, customerId } = req.query;
    let rows;

    let query = `SELECT 
                  r.*, c.*, g.*, c.name as "customerName", cat.name as "categoryName" , r.id as "rentalId"
                 FROM rentals r 
                 JOIN customers c ON r."customerId" = c.id 
                 JOIN games g ON r."gameId" = g.id
                 JOIN categories cat ON g."categoryId" = cat.id`;
    if (gameId) {
      query += ` where "gameId" = $1`;
      rows = (await db.query(query, [gameId])).rows;
    } else if (customerId) {
      query += ` where "customerId" = $1`;
      rows = (await db.query(query, [customerId])).rows;
    } else if (gameId && customerId) {
      query += ` where "customerId" = $1 and "gameId" = $2`;
      rows = (await db.query(query, [customerId, gameId])).rows;
    } else {
      rows = (await db.query(query)).rows;
    }

    res.send(
      rows.map((r) => {
        return {
          id: r.rentalId,
          customerId: r.customerId,
          gameId: r.gameId,
          rentDate: r.rentDate,
          daysRented: r.daysRented,
          returnDate: r.returnDate,
          originalPrice: r.originalPrice,
          delayFee: r.delayFee,
          customer: {
            id: r.customerId,
            name: r.customerName,
          },
          game: {
            id: r.gameId,
            name: r.name,
            categoryId: r.categoryId,
            categoryName: r.categoryName,
          },
        };
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}

export async function finalizarAluguel(req, res) {
  try {
    const { id } = req.params;
    const returnDate = new Date();
    const db = await connectDB();

    const { rows } = await db.query(
      `SELECT r.*, g.* FROM rentals r JOIN games g on r."gameId" = g.id  WHERE r.id = $1`,
      [id]
    );

    const aluguel = rows[0];

    if (rows.length === 0) return res.sendStatus(404);
    if (aluguel.returnDate != null) return res.sendStatus(400);

    const atraso =
      returnDate.getDate() - (aluguel.rentDate.getDate() + aluguel.daysRented);

    const delayFee = atraso > 0 ? aluguel.pricePerDay * atraso : 0;

    await db.query(` UPDATE rentals SET "returnDate" = $1, "delayFee" = $2`, [
      returnDate,
      delayFee,
    ]);

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}

export async function deletarAluguel(req, res) {
  try {
    const { id } = req.params;
    const db = await connectDB();

    let query = `SELECT * FROM rentals WHERE id = $1`;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) return res.sendStatus(404);
    if (rows[0].returnDate === null)
      return res.status(400).send("Fianlize o aluguel primeiro");

    await db.query(
      `
        DELETE from rentals WHERE id = $1
    `,
      [id]
    );

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}
