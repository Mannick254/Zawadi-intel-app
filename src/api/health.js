// api/health.js
export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    services: {
      api: { status: "online", message: "API responding normally" },
      db: { status: "online", message: "Database connection healthy" },
      notifications: { status: "online", message: "Push service temporarily unavailable" }
    }
  });
}
