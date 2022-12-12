import BaseJoi from "joi";
import JoiDate from "@joi/date";
const Joi = BaseJoi.extend(JoiDate);

const clienteModel = Joi.object({
  name: Joi.string().required().min(1),
  phone: Joi.string().required().max(11).min(10),
  cpf: Joi.string().required().max(11).min(11),
  birthday: Joi.date().format("YYYY-MM-DD").utc().required(),
});

export default clienteModel;
