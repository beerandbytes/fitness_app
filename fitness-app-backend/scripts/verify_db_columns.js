require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function verifyColumns() {
    console.log("🔍 Verifying 'exercises' table columns...");

    // Masked connection info
    const dbUrl = process.env.DATABASE_URL || '';
    const maskedUrl = dbUrl.replace(/:[^:@]*@/, ':****@');
    console.log(`Connecting to: ${maskedUrl}`);

    const client = await pool.connect();

    try {
        const result = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'exercises'
            ORDER BY column_name;
        `);

        console.log(`Found ${result.rows.length} columns:`);
        result.rows.forEach(row => {
            console.log(` - ${row.column_name} (${row.data_type})`);
        });

        const hasNameEs = result.rows.some(r => r.column_name === 'name_es');
        if (hasNameEs) {
            console.log("\n✅ Column 'name_es' IS present.");
        } else {
            console.error("\n❌ Column 'name_es' is MISSING.");
        }

    } catch (error) {
        console.error("❌ Error querying columns:", error);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyColumns();
