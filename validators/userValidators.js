// userValidators.js
import { body , validationResult} from "express-validator";

// Validation for creating a new user
export const createUserValidation = [
  body('fullname').notEmpty().trim().escape(),
  body('email').isEmail().normalizeEmail(),
  body('phoneNumber').optional().isMobilePhone('any'),
  body('username').optional().notEmpty().trim().escape(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    next();
  }
];



// Validation for user login
export const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ message: `Validation failed: ${errorMessages.join(', ')}` });
    }
    next();
  }
];
