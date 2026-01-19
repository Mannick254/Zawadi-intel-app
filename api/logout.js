
import { deleteSession } from '../_utils/session';

export default (req, res) => {
  deleteSession(req);
  res.setHeader('Set-Cookie', 'sessionId=; HttpOnly; Path=/; Max-Age=0');
  res.status(200).json({ message: 'Logout successful' });
};
