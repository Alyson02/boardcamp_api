import connectDB from "../db.js";
import clienteModel from "../models/clienteModel.js";
import dayjs from "dayjs";

export default async function clienteValidationMiddleware(req, res, next) {
  try {
    const body = req.body;
    const { id } = req.params;
    body.birthday = dayjs(body.birthday).format("YYYY-MM-DD");

    const { error } = clienteModel.validate(body, { abortEarly: false });
    if (error) {
      const erros = error.details.map((d) => d.message);
      return res.status(422).send(erros);
    }

    const db = await connectDB();
    const { rows } = await db.query(
      `
      SELECT * FROM customers WHERE cpf = $1
    `,
      [body.cpf]
    );

    if (rows.length > 0 && rows[0].id != id) return res.sendStatus(409);

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).send("Erro interno");
  }
}
