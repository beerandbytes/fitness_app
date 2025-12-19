/**
 * Script para verificar que los alimentos españoles están en la base de datos
 */

require('dotenv').config();
const { db } = require('../db/db_config');
const { foods } = require('../db/schema');
const { ilike, sql } = require('drizzle-orm');

async function verifySpanishFoods() {
    console.log('🔍 Verificando alimentos españoles en la base de datos...\n');
    
    try {
        // Contar total de alimentos
        const totalResult = await db.select({ count: sql`count(*)`.as('count') })
            .from(foods);
        const total = parseInt(totalResult[0].count);
        console.log(`📊 Total de alimentos en la base de datos: ${total}\n`);
        
        // Buscar algunos alimentos españoles específicos
        const testSearches = [
            'paella',
            'tortilla española',
            'jamón serrano',
            'bacalao',
            'gazpacho',
            'chorizo',
            'queso manchego',
            'pollo asado',
            'merluza',
            'pimientos del piquillo'
        ];
        
        console.log('🔎 Buscando alimentos españoles específicos:\n');
        
        for (const searchTerm of testSearches) {
            const results = await db.select()
                .from(foods)
                .where(ilike(foods.name, `%${searchTerm}%`))
                .limit(5);
            
            if (results.length > 0) {
                console.log(`✅ "${searchTerm}": ${results.length} resultado(s) encontrado(s)`);
                results.forEach(food => {
                    console.log(`   - ${food.name} (${food.calories_base} kcal/100g)`);
                });
            } else {
                console.log(`❌ "${searchTerm}": No encontrado`);
            }
            console.log('');
        }
        
        // Buscar alimentos con técnicas de cocción españolas
        console.log('🍳 Verificando técnicas de cocción españolas:\n');
        const cookingTechniques = ['asado', 'horneado', 'ahumado', 'salazón', 'plancha', 'escabeche'];
        
        for (const technique of cookingTechniques) {
            const results = await db.select({ count: sql`count(*)`.as('count') })
                .from(foods)
                .where(ilike(foods.name, `%${technique}%`));
            
            const count = parseInt(results[0].count);
            console.log(`   ${technique}: ${count} alimento(s)`);
        }
        
        console.log('\n✅ Verificación completada!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
    
    process.exit(0);
}

verifySpanishFoods();

