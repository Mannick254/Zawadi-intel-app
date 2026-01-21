const jwt = require('jsonwebtoken');

// This function verifies the JWT token sent with the request.
// It returns the decoded session if the token is valid, otherwise null.
function verifyToken(req) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return null;
  }

  const token = authHeader.split(' ')[1]; // Expecting "Bearer <token>"
  if (!token) {
    return null;
  }

  try {
    // The secret key should be an environment variable for security.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded; // The decoded payload (e.g., { userId, username, iat, exp })
  } catch (error) {
    console.error('Invalid token:', error);
    return null;
  }
}

module.exports = { verifyToken };
