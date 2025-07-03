// In your login controller
import jwt from "jsonwebtoken";

export const generateToken = (user, res) => {
  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15d',
  });

 res.cookie('token', token, {
  httpOnly: true,
  maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
  sameSite: 'None', // ✅ MUST be 'None' for cross-origin cookies
  secure: true,     // ✅ MUST be true when using SameSite: 'None'
});
};
