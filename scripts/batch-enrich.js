/* eslint-disable */
// Batch enrichment script for multiple municipalities
const fs = require("fs");
const path = require("path");
const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const serviceAccount = require("../node/k.json");

// Check if OpenAI API key is available
if (!process.env.OPENAI_API_KEY) {
  console.error("Error: OPENAI_API_KEY environment variable is required");
  console.error("Please set your OpenAI API key: export OPENAI_API_KEY=your_key_here");
  process.exit(1);
}

function initAdmin(serviceAccount) {
  if (getApps().length) return; // Reuse if already initialized
  initializeApp({ credential: cert(serviceAccount) });
}

// Get statistics for a municipality
async function getMunicipalityStats(db, municipalityCode) {
  try {
    // Total places
    const totalQuery = db.collection("places")
      .where("municipality_code", "==", municipalityCode);
    const totalSnapshot = await totalQuery.get();
    const total = totalSnapshot.size;

    // Enriched places
    const enrichedQuery = db.collection("places")
      .where("municipality_code", "==", municipalityCode)
      .where("enriched_at", "!=", null);
    const enrichedSnapshot = await enrichedQuery.get();
    const enriched = enrichedSnapshot.size;

    // Error places
    const errorQuery = db.collection("places")
      .where("municipality_code", "==", municipalityCode)
      .where("enrichment_error", "==", true);
    const errorSnapshot = await errorQuery.get();
    const errors = errorSnapshot.size;

    // Pending places
    const pending = total - enriched;

    // Get municipality name (from first place)
    let municipalityName = "Unknown";
    if (totalSnapshot.docs.length > 0) {
      const firstPlace = totalSnapshot.docs[0].data();
      municipalityName = firstPlace.municipality || "Unknown";
    }

    return {
      municipalityCode,
      municipalityName,
      total,
      enriched,
      errors,
      pending: Math.max(0, pending)
    };
  } catch (error) {
    console.error(`Error getting stats for municipality ${municipalityCode}:`, error.message);
    return {
      municipalityCode,
      municipalityName: "Error",
      total: 0,
      enriched: 0,
      errors: 0,
      pending: 0
    };
  }
}

async function showStats() {
  initAdmin(serviceAccount);
  const db = getFirestore();

  console.log("📊 Analyzing enrichment status by municipality...\n");

  try {
    // Get all unique municipality codes
    const placesSnapshot = await db.collection("places").get();
    const municipalityCodes = new Set();
    
    placesSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.municipality_code) {
        municipalityCodes.add(data.municipality_code);
      }
    });

    console.log(`Found ${municipalityCodes.size} unique municipalities\n`);

    // Get stats for each municipality
    const stats = [];
    const codes = Array.from(municipalityCodes).sort((a, b) => a - b);
    
    for (const code of codes) {
      const stat = await getMunicipalityStats(db, code);
      stats.push(stat);
      
      // Show progress
      process.stdout.write(`\rProcessing ${stats.length}/${codes.length} municipalities...`);
    }
    
    console.log("\n");

    // Sort by pending count (descending)
    stats.sort((a, b) => b.pending - a.pending);

    // Display results
    console.log("┌──────────┬─────────────────────────────┬───────┬──────────┬────────┬─────────┐");
    console.log("│   Code   │         Municipality        │ Total │ Enriched │ Errors │ Pending │");
    console.log("├──────────┼─────────────────────────────┼───────┼──────────┼────────┼─────────┤");
    
    for (const stat of stats) {
      const code = stat.municipalityCode.toString().padStart(8);
      const name = stat.municipalityName.substring(0, 27).padEnd(27);
      const total = stat.total.toString().padStart(5);
      const enriched = stat.enriched.toString().padStart(8);
      const errors = stat.errors.toString().padStart(6);
      const pending = stat.pending.toString().padStart(7);
      
      console.log(`│ ${code} │ ${name} │ ${total} │ ${enriched} │ ${errors} │ ${pending} │`);
    }
    
    console.log("└──────────┴─────────────────────────────┴───────┴──────────┴────────┴─────────┘");

    // Summary
    const totalStats = stats.reduce((acc, stat) => ({
      total: acc.total + stat.total,
      enriched: acc.enriched + stat.enriched,
      errors: acc.errors + stat.errors,
      pending: acc.pending + stat.pending
    }), { total: 0, enriched: 0, errors: 0, pending: 0 });

    console.log(`\n📈 Summary:`);
    console.log(`   Total places: ${totalStats.total.toLocaleString()}`);
    console.log(`   Enriched: ${totalStats.enriched.toLocaleString()} (${(totalStats.enriched / totalStats.total * 100).toFixed(1)}%)`);
    console.log(`   Errors: ${totalStats.errors.toLocaleString()} (${(totalStats.errors / totalStats.total * 100).toFixed(1)}%)`);
    console.log(`   Pending: ${totalStats.pending.toLocaleString()} (${(totalStats.pending / totalStats.total * 100).toFixed(1)}%)`);

    // Top 10 municipalities with most pending
    console.log(`\n🎯 Top 10 municipalities with most pending enrichments:`);
    const top10 = stats.filter(s => s.pending > 0).slice(0, 10);
    for (let i = 0; i < top10.length; i++) {
      const stat = top10[i];
      console.log(`   ${i + 1}. ${stat.municipalityName} (${stat.municipalityCode}): ${stat.pending} pending`);
    }

  } catch (error) {
    console.error("Error analyzing data:", error);
    process.exit(1);
  }
}

async function main() {
  const command = process.argv[2];
  
  if (command === "stats" || command === "--stats" || !command) {
    await showStats();
    return;
  }

  console.error("Usage:");
  console.error("  node batch-enrich.js stats           # Show enrichment statistics");
  console.error("  node batch-enrich.js                 # Show enrichment statistics (default)");
  console.error("");
  console.error("To enrich a specific municipality, use:");
  console.error("  node enrich-places-by-municipality.js <municipality_code>");
  process.exit(1);
}

main().catch((e) => {
  console.error("Unhandled error:", e);
  process.exit(1);
});
