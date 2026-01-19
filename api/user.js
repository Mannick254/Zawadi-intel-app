
import { getSession } from '../_utils/session';

export default (req, res) => {
  const session = getSession(req);

  if (session && session.user) {
    res.status(200).json(session.user);
  } else {
    res.status(401).json({ message: 'Not authenticated' });
  }
};
