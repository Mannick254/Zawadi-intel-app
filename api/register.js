const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_FILE = path.join(process.cwd(), 'server', 'data.json');

// --- Helper Functions to Read/Write Data ---
function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(fileContent);
    }
    // Return a default structure if the file doesn't exist
    return { users: [], articles: [] };
  } catch (error) {
    console.error("Error reading data.json:", error);
    return { users: [], articles: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (error) {
    console.error("Error writing to data.json:", error);
  }
}

// --- Main handler for /api/register ---
module.exports = (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username?.trim() || !password?.trim()) {
    return res.status(400).json({ ok: false, message: 'Username and password are required' });
  }

  // In a real application, you should add more robust validation
  // (e.g., password strength, username format).

  const data = readData();
  
  // Check if the username is already taken
  if (data.users && data.users.some(user => user.username === username)) {
    return res.status(409).json({ ok: false, message: 'Username already exists' });
  }

  // In a production environment, you MUST hash the password.
  // Storing plain text passwords is a major security risk.
  const newUser = {
    id: crypto.randomBytes(16).toString("hex"),
    username: username,
    password: password, // HASH THIS in a real app (e.g., using bcrypt)
    isAdmin: false, // Default to not being an admin
    createdAt: Date.now(),
  };

  // Initialize users array if it doesn't exist
  if (!data.users) {
    data.users = [];
  }

  data.users.push(newUser);
  writeData(data);

  return res.status(201).json({ ok: true, message: 'User registered successfully' });
};
