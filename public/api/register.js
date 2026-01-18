
import { users } from '../_utils/users';

export default (req, res) => {
  const { username, password } = req.body;

  if (users.find((u) => u.username === username)) {
    return res.status(409).json({ message: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    username,
    password, // In a real app, hash and salt the password
    isAdmin: false,
  };

  users.push(newUser);

  res.status(201).json({ ...newUser, message: 'User created successfully' });
};
