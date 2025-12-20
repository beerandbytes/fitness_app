require('dotenv').config();
const { db } = require('../db/db_config');
const { exercises } = require('../db/schema');
const { eq, asc, sql } = require('drizzle-orm');

async function run() {
    try {
        console.log("Connecting...");

        console.log("Testing count query...");
        const totalResult = await db.select({
            count: sql`count(*)`.as('count')
        })
            .from(exercises)
            .where(eq(exercises.is_public, true));

        console.log("Count result structure:", JSON.stringify(totalResult, null, 2));

        if (totalResult && totalResult.length > 0) {
            const rawCount = totalResult[0].count;
            console.log("Raw count value:", rawCount, "Type:", typeof rawCount);
            const total = parseInt(rawCount);
            console.log("Parsed total:", total);
        } else {
            console.log("No totalResult returned!");
        }

    } catch (e) {
        console.error("ERROR CAUGHT:");
        console.error(e);
    }
    process.exit(0);
}

run();
