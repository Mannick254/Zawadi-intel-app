# Zawadi Minimal Server

A lightweight Node.js + Express server powering **Zawadi Intel’s login tracking system**.  
It provides simple API endpoints for recording login activity and retrieving statistics, while also serving static admin pages for monitoring.

---

## ✨ Features
- **Login Tracking**
  - `POST /api/login` → Records a login event.
  - `GET /api/stats` → Returns total login count and recent login events.

- **Recent Logins**
  - Keeps the last 20 login events in memory for quick inspection.

- **Static File Serving**
  - Serves files from the `public/` directory (e.g., `admin.html`) at `http://localhost:3001/admin.html`.

- **Security & Logging**
  - Uses `helmet` for basic security headers.
  - Uses `morgan` for request logging.

---

## 📄 API Reference

### POST `/api/login`
Record a login event.

**Request Body:**
```json
{
  "username": "Nickson",
  "ts": 1640995200000
}
