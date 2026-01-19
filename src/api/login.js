import { createSession } from '../_utils/session';
import { users } from '../_utils/users';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body || {};
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ ok: false, message: 'Invalid credentials' });
  }

  const sessionId = createSession(user);
  res.setHeader(
    'Set-Cookie',
    `sessionId=${sessionId}; HttpOnly; Path=/; Secure; SameSite=Strict`
  );

  res.status(200).json({
    ok: true,
    username: user.username,
    isAdmin: user.isAdmin,
    createdAt: user.createdAt,
    message: 'Login successful',
  });
}
