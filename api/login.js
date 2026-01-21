const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const DATA_FILE = path.join(process.cwd(), 'server', 'data.json');

// --- Helper function to read user data ---
function getUsers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf8");
      const data = JSON.parse(fileContent);
      return data.users || [];
    }
    return [];
  } catch (error) {
    console.error("Error reading user data:", error);
    return [];
  }
}

// --- Main handler for /api/login ---
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'Username and password are required' });
  }

  const users = getUsers();
  const user = users.find(u => u.username === username && u.password === password); // Note: Passwords should be hashed in a real app

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }

  // --- Generate JWT Token ---
  try {
    const token = jwt.sign(
      { userId: user.id, username: user.username, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Return the token in the response body, as expected by the client
    return res.status(200).json({
      ok: true,
      token: token, // This is what api/auth.js is looking for
      message: 'Login successful',
    });

  } catch (error) {
    console.error("JWT Signing Error:", error);
    return res.status(500).json({ ok: false, message: 'Could not generate authentication token.' });
  }
};
