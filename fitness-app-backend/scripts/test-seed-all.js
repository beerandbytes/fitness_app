/**
 * Script de prueba para verificar que seed-all.js funciona correctamente
 * Ejecutar localmente ANTES de desplegar a Render
 * 
 * Uso: node scripts/test-seed-all.js
 */

require('dotenv').config();
const { execSync } = require('child_process');

console.log('🧪 Probando script seed-all.js...\n');

// Verificar que las variables de entorno estén configuradas
if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada');
    console.log('   Configura DATABASE_URL en tu archivo .env');
    process.exit(1);
}

console.log('✅ DATABASE_URL configurada');
console.log(`   Base de datos: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}\n`);

// Verificar que las tablas existan (ejecutar migraciones primero)
console.log('📋 Verificando que las migraciones se hayan ejecutado...');
try {
    execSync('npm run db:migrate', { 
        stdio: 'inherit',
        cwd: process.cwd()
    });
    console.log('✅ Migraciones verificadas/ejecutadas\n');
} catch (error) {
    console.error('❌ Error al ejecutar migraciones:', error.message);
    console.log('   Ejecuta manualmente: npm run db:migrate');
    process.exit(1);
}

// Ejecutar el script seed-all
console.log('🌱 Ejecutando seed-all.js...\n');
try {
    execSync('npm run seed:all', { 
        stdio: 'inherit',
        cwd: process.cwd()
    });
    console.log('\n✅ Script seed-all.js ejecutado correctamente!');
    console.log('\n📊 Verifica manualmente:');
    console.log('   1. Conecta a tu base de datos');
    console.log('   2. Ejecuta: SELECT COUNT(*) FROM exercises WHERE is_public = true;');
    console.log('   3. Ejecuta: SELECT COUNT(*) FROM foods;');
    console.log('   4. Deberías ver números > 0 en ambos casos');
} catch (error) {
    console.error('\n❌ Error al ejecutar seed-all.js');
    console.error('   Revisa los logs anteriores para más detalles');
    process.exit(1);
}

