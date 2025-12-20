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

        const requiredColumns = ['name_es', 'description', 'muscles', 'equipment'];
        let missingColumns = [];

        // Simple polling mechanism (max 5 retries)
        for (let i = 0; i < 5; i++) {
            const result = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'exercises';
            `);

            const existingColumns = result.rows.map(r => r.column_name);
            missingColumns = requiredColumns.filter(col => !existingColumns.includes(col));

            if (missingColumns.length === 0) {
                console.log("\n✅ All required columns (name_es, etc.) are present.");
                process.exit(0);
            }

            console.log(`⚠️  Missing columns: ${missingColumns.join(', ')}. Retrying in 2s... (${i + 1}/5)`);
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.error("\n❌ Timeout waiting for columns. Still missing:", missingColumns);
        process.exit(1);

    } catch (error) {
        console.error("❌ Error querying columns:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyColumns();
