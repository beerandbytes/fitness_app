require('dotenv').config();
const { db } = require('../db/db_config');
const { foods } = require('../db/schema');
const { ilike } = require('drizzle-orm');

(async () => {
    const r = await db.select().from(foods).where(ilike(foods.name, '%pollo%')).limit(5);
    console.log('Búsqueda "pollo":', r.length, 'resultados');
    r.forEach(f => console.log('  -', f.name));
    process.exit(0);
})().catch(e => {
    console.error(e);
    process.exit(1);
});

