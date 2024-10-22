// adminValidators.js
import { body, validationResult } from 'express-validator';

// Validation for creating a new admin
export const createAdminValidation = [
  body('username').notEmpty().trim().escape(),
  body('password').isLength({ min: 6 }),
  body('fullname').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    next();
  }
];

