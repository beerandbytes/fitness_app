require('dotenv').config();
const { db } = require('../db/db_config');
const schema = require('../db/schema');
const { bodyMeasurements, users } = schema;
const { eq, desc } = require('drizzle-orm');

async function debugQuery() {
    console.log("🔍 Debugging progress query...");

    try {
        // Get a user to test with
        const user = await db.select().from(users).limit(1);

        if (user.length === 0) {
            console.log("❌ No users found to test with.");
            process.exit(1);
        }

        const user_id = user[0].user_id;
        console.log(`Using user_id: ${user_id}`);

        console.log("Attempting query: db.select().from(bodyMeasurements).where(eq(bodyMeasurements.user_id, user_id))...");

        const measurements = await db.select()
            .from(bodyMeasurements)
            .where(eq(bodyMeasurements.user_id, user_id))
            .orderBy(desc(bodyMeasurements.date));

        console.log("✅ Query successful!");
        console.log("Results:", measurements);

    } catch (error) {
        console.error("❌ Query FAILED:");
        console.error("Message:", error.message);
        console.error("Code:", error.code);
        console.error("Detail:", error.details); // Drizzle might expose postgres details
        if (error.routine) console.error("Routine:", error.routine);
        // console.error("Full Error:", error);
    } finally {
        // db connection close might be needed depending on implementation, 
        // but typically pool stays open. For script, we force exit or let it hang.
        // db_config usually exports a drizzle instance wrapping a pool.
        process.exit(0);
    }
}

debugQuery();
