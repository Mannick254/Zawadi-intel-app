
const fs = require('fs');
const path = require('path');

// Path to the data file, assuming the Vercel function is in the /api directory
const DATA_FILE = path.join(process.cwd(), 'server', 'data.json');

function readLocalData() {
  try {
    // Make sure to handle the case where the file doesn't exist
    if (fs.existsSync(DATA_FILE)) {
        const fileContent = fs.readFileSync(DATA_FILE, "utf8");
        return JSON.parse(fileContent);
    }
    return { total: 0, recent: [], subscriptions: [], articles: [] };
  } catch (error) {
    console.error("Error reading or parsing data.json:", error);
    // Return a default structure on error to prevent crashes
    return { total: 0, recent: [], subscriptions: [], articles: [] };
  }
}

async function getStats() {
  const data = readLocalData();
  return { total: data.total || 0, recent: data.recent || [] };
}

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const stats = await getStats();
        res.status(200).json({
            ok: true,
            stats,
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        console.error("Stats error:", err.stack || err);
        res.status(500).json({
            ok: false,
            message: "Failed to read stats"
        });
    }
};
