
import { v4 as uuidv4 } from 'uuid';

const sessions = {};

export function createSession(user) {
  const sessionId = uuidv4();
  sessions[sessionId] = {
    user,
    createdAt: Date.now(),
  };
  return sessionId;
}

export function getSession(req) {
  const sessionId = req.headers.cookie?.split('=')[1];
  if (sessionId && sessions[sessionId]) {
    return sessions[sessionId];
  }
  return null;
}

export function deleteSession(req) {
  const sessionId = req.headers.cookie?.split('=')[1];
  if (sessionId) {
    delete sessions[sessionId];
  }
}
