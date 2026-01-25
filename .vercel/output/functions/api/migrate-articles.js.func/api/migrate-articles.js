
// This is a standalone script to migrate HTML articles to the database.
// To run it, use the following command from your project root:
// node api/migrate-articles.js

require("dotenv").config();
const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

// --- Configuration ---
// Use __dirname to create a robust path to the articles directory
// This ensures that the script works regardless of where it's run from
const ARTICLES_DIR = path.join(__dirname, '..', 'public', 'articles');

// --- Main Migration Logic ---
async function migrate() {
  // 1. --- Database Connection ---
  if (!process.env.POSTGRES_URL) {
    console.error("❌ Error: POSTGRES_URL environment variable is not set.");
    process.exit(1);
  }
  const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: { rejectUnauthorized: false },
  });

  let client;
  try {
    client = await pool.connect();
    console.log("✅ Connected to the database successfully.");
  } catch (dbError) {
    console.error("❌ Database connection error:", dbError);
    process.exit(1);
  }

  // 2. --- File Processing and Migration ---
  try {
    console.log(`📂 Reading articles from: ${ARTICLES_DIR}`);
    const filenames = await fs.readdir(ARTICLES_DIR);
    const htmlFiles = filenames.filter(file => file.endsWith('.html'));
    console.log(`Found ${htmlFiles.length} HTML files to migrate.`);

    if (htmlFiles.length === 0) {
        console.warn("⚠️ No HTML files found. Please ensure the ARTICLES_DIR is correct.");
        return; // Exit if no files are found
    }

    let migratedCount = 0;
    let failedFiles = [];

    for (const file of htmlFiles) {
      try {
        const filePath = path.join(ARTICLES_DIR, file);
        const htmlContent = await fs.readFile(filePath, 'utf8');

        let title = null;
        let imageUrl = null;
        let content = null;

        // --- Robust Title Extraction ---
        const h1Match = htmlContent.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
        if (h1Match && h1Match[1]) {
          title = h1Match[1].trim();
        }
        if (!title) {
          const titleTagMatch = htmlContent.match(/<title>([\s\S]*?)<\/title>/);
          if (titleTagMatch && titleTagMatch[1]) {
            title = titleTagMatch[1].replace(/Zawadi Intel\s*—\s*/, '').replace(/\|\s*Zawadi Intel/, '').trim();
          }
        }
        if (!title) {
          const jsonLdMatch = htmlContent.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
          if (jsonLdMatch && jsonLdMatch[1]) {
            try {
              const jsonLd = JSON.parse(jsonLdMatch[1]);
              if (jsonLd.headline) title = jsonLd.headline.trim();
            } catch (e) { /* Ignore JSON parsing errors */ }
          }
        }

        // --- Image and Body Extraction ---
        const imageMatch = htmlContent.match(/<meta\s+property="og:image"\s+content="([^"].+?)"/);
        imageUrl = imageMatch ? imageMatch[1].trim() : null;

        const bodyMatch = htmlContent.match(/<div class="article-body"[^>]*>([\s\S]*?)<\/div>/);
        if (bodyMatch && bodyMatch[1]) {
          content = bodyMatch[1].replace(/<p><a href="[^>]*">.+?Back to Homepage.*?<\/a><\/p>\s*$/, '').trim();
        }

        if (!title || !content) {
          let reason = !title ? "Title not found" : "Content not found";
          console.warn(`⚠️ Skipping ${file}: ${reason}.`);
          failedFiles.push({ file, reason });
          continue;
        }

        // --- Insert into database ---
        const newId = crypto.randomBytes(16).toString("hex");
        const createdAt = new Date().toISOString();
        await client.query(
          'INSERT INTO articles (id, title, content, image_url, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)',
          [newId, title, content, imageUrl, createdAt, createdAt]
        );
        console.log(`  -> Migrated: ${title}`);
        migratedCount++;

      } catch (fileError) {
        console.error(`❌ Error processing file ${file}:`, fileError);
        failedFiles.push({ file, reason: fileError.message });
      }
    }

    // 3. --- Final Report ---
    console.log("\n--- Migration Complete ---");
    console.log(`✅ Successfully migrated ${migratedCount} articles.`);
    if (failedFiles.length > 0) {
      console.warn(`⚠️ Failed to migrate ${failedFiles.length} files:`);
      failedFiles.forEach(f => console.warn(`  - ${f.file}: ${f.reason}`));
    }
    console.log("--------------------------\n");

  } catch (error) {
    console.error("❌ An unexpected error occurred during the migration process:", error);
  } finally {
    if (client) {
      await client.release();
      console.log("🔌 Database connection closed.");
    }
    await pool.end();
  }
}

migrate();
