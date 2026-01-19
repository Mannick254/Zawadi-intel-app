import { deleteSession } from '../_utils/session';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  deleteSession(req);

  res.setHeader(
    'Set-Cookie',
    'sessionId=; HttpOnly; Path=/; Max-Age=0; Secure; SameSite=Strict'
  );

  res.status(200).json({ ok: true, message: 'Logout successful' });
}
