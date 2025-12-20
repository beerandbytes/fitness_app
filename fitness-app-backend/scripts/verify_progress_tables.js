require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function verifyProgressTables() {
    console.log("🔍 Verifying progress tables and columns...");

    const client = await pool.connect();
    // Define expected columns for each table
    const schemaExpectations = {
        'body_measurements': [
            'measurement_id', 'user_id', 'date', 'chest', 'waist', 'hips',
            'arms', 'thighs', 'neck', 'shoulders', 'body_fat_percentage'
        ],
        'progress_photos': [
            'photo_id', 'user_id', 'date', 'photo_front', 'photo_side',
            'photo_back', 'weight', 'notes'
        ]
    };

    let allOk = true;

    try {
        for (const [tableName, columns] of Object.entries(schemaExpectations)) {
            // Check table existence
            const tableRes = await client.query(`SELECT to_regclass('${tableName}') as exists;`);
            if (!tableRes.rows[0].exists) {
                console.log(`❌ Table '${tableName}' DOES NOT exist.`);
                allOk = false;
                continue;
            }
            console.log(`✅ Table '${tableName}' exists.`);

            // Check columns
            const colRes = await client.query(`
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = '${tableName}';
            `);
            const existingColumns = colRes.rows.map(r => r.column_name);

            const missingCols = columns.filter(col => !existingColumns.includes(col));

            if (missingCols.length > 0) {
                console.log(`❌ Table '${tableName}' is missing columns: ${missingCols.join(', ')}`);
                allOk = false;
            } else {
                console.log(`✅ Table '${tableName}' has all required columns.`);
            }
        }

        if (allOk) {
            console.log("\n✅ All progress tables and columns are present.");
            process.exit(0);
        } else {
            console.error("\n❌ Schema verification FAILED.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Error verifying schema:", error);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

verifyProgressTables();
