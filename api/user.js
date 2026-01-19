import { getSession } from '../_utils/session';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const session = getSession(req);

  if (session && session.user) {
    const { username, isAdmin, createdAt } = session.user;
    res.status(200).json({ ok: true, username, isAdmin, createdAt });
  } else {
    res.status(401).json({ ok: false, message: 'Not authenticated' });
  }
}
