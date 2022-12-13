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
    const {
      gameId,
      customerId,
      status,
      startDate,
      offset,
      limit,
      order,
      desc,
    } = req.query;
    let rows;

    let query = `SELECT 
                  r.*, c.*, g.*, c.name as "customerName", cat.name as "categoryName" , r.id as "rentalId"
                 FROM rentals r 
                 JOIN customers c ON r."customerId" = c.id 
                 JOIN games g ON r."gameId" = g.id
                 JOIN categories cat ON g."categoryId" = cat.id`;

    if (gameId && !customerId) {
      query += ` where "gameId" = $1`;
    }

    if (customerId && !gameId) {
      query += ` where "customerId" = $1`;
    }

    if (gameId && customerId) {
      query += ` where "customerId" = $1 and "gameId" = $2`;
    }

    if (startDate && !gameId && !customerId) {
      query += ` WHERE "rentDate" > $1`;
    }

    if (startDate && !gameId && customerId) {
      query += ` AND "rentDate" > $2`;
    }

    if (startDate && gameId && !customerId) {
      query += ` AND "rentDate" > $2`;
    }

    if (startDate && gameId && customerId) {
      query += ` AND "rentDate" > $3`;
    }

    if (status && !gameId && !customerId && !startDate) {
      if (status === "open") {
        query += ` WHERE "returnDate" IS NULL`;
      } else if (status === "closed") {
        query += ` WHERE "returnDate" IS NOT NULL`;
      }
    }

    if (status && (gameId || customerId || startDate)) {
      if (status === "open") {
        query += ` AND "returnDate" IS NULL`;
      } else if (status === "closed") {
        query += ` AND "returnDate" IS NOT NULL`;
      }
    }

    if (limit) {
      query += ` LIMIT ${limit}`;
    }

    if (offset) {
      query += ` OFFSET  ${offset}`;
    }

    if (order) {
      const orderSeparado = order.split(".");
      const table = orderSeparado[0];
      const column = orderSeparado[1];
      query += ` ORDER BY ${table}."${column}"`;
    }

    if (desc) {
      query += ` DESC`;
    }

    if (gameId && !customerId) {
      if (startDate) {
        rows = (await db.query(query, [gameId, startDate])).rows;
      } else {
        rows = (await db.query(query, [gameId])).rows;
      }
    }

    if (customerId && !gameId) {
      if (startDate) {
        rows = (await db.query(query, [customerId, startDate])).rows;
      } else {
        rows = (await db.query(query, [customerId])).rows;
      }
    }

    if (gameId && customerId) {
      if (startDate) {
        rows = (await db.query(query, [customerId, gameId, startDate])).rows;
      } else {
        rows = (await db.query(query, [customerId, gameId])).rows;
      }
    }

    if (startDate && !gameId && !customerId) {
      rows = (await db.query(query, [startDate])).rows;
    }

    if (!gameId && !customerId && !startDate) {
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

    await db.query(
      ` UPDATE rentals SET "returnDate" = $1, "delayFee" = $2 WHERE id = $3`,
      [returnDate, delayFee, id]
    );

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

export async function metricas(req, res) {
  try {
    const db = await connectDB();
    const { startDate, endDate } = req.query;

    let queryReceita = `SELECT SUM("delayFee" + "originalPrice") as revenue from rentals`;
    let queryAluguel = `SELECT COUNT(*) as rentals FROM rentals`;

    if (startDate && !endDate) {
      queryReceita += ` WHERE "rentDate" > '${startDate}'`;
      queryAluguel += ` WHERE "rentDate" > '${startDate}'`;
    }

    if (!startDate && endDate) {
      queryReceita += ` WHERE "rentDate" < '${endDate}'`;
      queryAluguel += ` WHERE "rentDate" < '${endDate}'`;
    }

    if (startDate && endDate) {
      queryReceita += ` WHERE "rentDate" BETWEEN '${startDate}' AND '${endDate}'`;
      queryAluguel += ` WHERE "rentDate" BETWEEN '${startDate}' AND '${endDate}'`;
    }

    console.log(queryAluguel);

    const revenue = (await db.query(queryReceita)).rows[0].revenue;

    const rentals = (await db.query(queryAluguel)).rows[0].rentals;

    const average = (revenue / rentals).toFixed(2);

    if (isNaN(average)) return res.sendStatus(400);

    res.send({ revenue, rentals, average });
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}
