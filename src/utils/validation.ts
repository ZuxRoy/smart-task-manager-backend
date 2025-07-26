import Joi from 'joi';

export const userValidation = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('admin', 'member').default('member')
});

export const taskValidation = Joi.object({
  title: Joi.string().max(200).required(),
  description: Joi.string().max(1000).required(),
  assignedTo: Joi.string().required(),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  dueDate: Joi.date().greater('now').required()
});

export const loginValidation = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});
