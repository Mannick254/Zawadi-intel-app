import { users } from '../_utils/users';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password required' });
  }

  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password, // ⚠️ hash in production
    isAdmin: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);

  res.status(201).json({
    ok: true,
    id: newUser.id,
    username: newUser.username,
    isAdmin: newUser.isAdmin,
    createdAt: newUser.createdAt,
    message: 'User created successfully',
  });
}
