import bcrypt from "bcrypt";


// let saltRounds = process.env.saltRounds;
let saltRounds = 10;

/**
 * Hashes a password using bcrypt.
 * @param {string} password The password to be hashed.
 * @returns {Promise<string>} A promise that resolves with the hashed password.
 */

export const hashPassword = async (password) => {
  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
  } catch (error) {
    console.error('Error hashing password:', error);
    throw new Error('Error hashing password');
  }
};


/**
 * Compares a password with its hashed counterpart using bcrypt.
 * @param {string} password The plain password to compare.
 * @param {string} hashedPassword The hashed password to compare against.
 * @returns {Promise<boolean>} A promise that resolves with a boolean indicating whether the passwords match.
 */

export const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

