import connectDB from "../db.js";

export async function adicionarCategoria(req, res) {
  try {
    const body = req.body;

    const db = await connectDB();
    await db.query(
      `
        INSERT INTO categories VALUES(default, $1)
    `,
      [body.name]
    );

    res.sendStatus(201);
  } catch (error) {
    res.status(500).send("Erro interno");
  }
}

export async function listarCategorias(req, res) {
  try {
    const db = await connectDB();
    const { rows } = await db.query("SELECT * FROM categories");
    res.send(rows);
  } catch (error) {
    res.status(500).send("Erro interno");
  }
}
