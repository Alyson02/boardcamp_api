import Joi from "joi";

const jogoModel = Joi.object({
  name: Joi.string().required().max(100),
  stockTotal: Joi.number().greater(0).required(),
  pricePerDay: Joi.number().greater(0).required(),
  image: Joi.string().uri().required(),
  categoryId: Joi.number().greater(0).required(),
});

export default jogoModel;
