import { validationResult } from 'express-validator';
import { AppError } from '../utils/errors.js';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map((err) => err.msg);
    throw new AppError(errorMessages.join(', '), 400);
  }
  next();
};

