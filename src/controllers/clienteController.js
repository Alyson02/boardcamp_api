import connectDB from "../db.js";

export async function adicionarCliente(req, res) {
  try {
    const body = req.body;

    const db = await connectDB();
    await db.query(
      `
        INSERT INTO customers VALUES(default, $1, $2, $3, $4)
    `,
      [body.name, body.phone, body.cpf, body.birthday]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Erro interno");
  }
}

export async function listarClientes(req, res) {
  try {
    const db = await connectDB();
    const { cpf } = req.query;
    let rows;

    let query = ` SELECT c.*, COUNT(r."customerId") as rentalsCount 
                  FROM customers c JOIN rentals r on c.id = r."customerId" 
                  GROUP BY r."customerId", c.id`;
    if (cpf) {
      query += ` HAVING cpf like $1`;
      rows = (await db.query(query, [`${cpf}%`])).rows;
    } else {
      rows = (await db.query(query)).rows;
    }

    res.send(rows);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}

export async function clientePorId(req, res) {
  try {
    const db = await connectDB();
    const { id } = req.params;

    let query = `SELECT * FROM customers WHERE id = $1`;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) return res.sendStatus(404);

    res.send(rows[0]);
  } catch (error) {
    res.status(500).send("Erro interno");
  }
}

export async function atualizarCliente(req, res) {
  try {
    const body = req.body;
    const { id } = req.params;
    const db = await connectDB();

    let query = `SELECT * FROM customers WHERE id = $1`;

    const { rows } = await db.query(query, [id]);

    if (rows.length === 0) return res.sendStatus(404);

    await db.query(
      `
        UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5
    `,
      [body.name, body.phone, body.cpf, body.birthday, id]
    );

    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(500).send("Erro interno");
  }
}
