import jwt from "jsonwebtoken";

/**
 * Generates a signed JWT token for authentication
 * @param {string} userId - MongoDB _id of the user
 * @param {string} role - User role (admin, doctor, patient)
 * @returns {string} Signed JWT token
 */
const generateToken = (userId, role) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "30d" } // default 30 days
    );
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Token generation failed");
  }
};

export default generateToken;
