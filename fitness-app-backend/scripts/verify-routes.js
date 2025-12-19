// Script para verificar que todas las rutas importadas existan
const fs = require('fs');
const path = require('path');

const routesDir = path.join(__dirname, '../routes');
const routes = [
    'auth', 'authSocial', 'logs', 'foods', 'mealItems', 'routines', 
    'exercises', 'workouts', 'goals', 'calendar', 'onboarding', 
    'admin', 'brand', 'notifications', 'achievements', 'coach', 
    'client', 'invite', 'templates', 'checkins', 'messages', 
    'health', 'streaks', 'progress'
];

console.log('🔍 Verificando rutas del backend...\n');

let allOk = true;
routes.forEach(route => {
    const filePath = path.join(routesDir, `${route}.js`);
    if (fs.existsSync(filePath)) {
        try {
            require(filePath);
            console.log(`✅ ${route}.js - OK`);
        } catch (error) {
            console.log(`❌ ${route}.js - Error: ${error.message}`);
            allOk = false;
        }
    } else {
        console.log(`❌ ${route}.js - Archivo no encontrado`);
        allOk = false;
    }
});

console.log('\n' + '='.repeat(50));
if (allOk) {
    console.log('✅ Todas las rutas están correctamente configuradas');
} else {
    console.log('❌ Se encontraron errores en las rutas');
    process.exit(1);
}
