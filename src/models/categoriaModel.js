import Joi from "joi";

const categoriaModel = Joi.object({
  name: Joi.string().required().max(100),
});

export default categoriaModel;
