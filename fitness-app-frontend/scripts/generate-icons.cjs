/**
 * Script para generar iconos placeholder PWA
 * Requiere: npm install sharp
 * Uso: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Verificar si sharp está instalado
let sharp;
try {
    sharp = require('sharp');
} catch (e) {
    console.error('❌ Error: sharp no está instalado.');
    console.log('📦 Instala sharp con: npm install sharp');
    console.log('💡 O usa el archivo HTML: public/icons/create-placeholder-icons.html');
    process.exit(1);
}

const iconsDir = path.join(__dirname, '../public/icons');
const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// Crear directorio si no existe
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Crear un SVG base para el icono
function createIconSVG(size, isMaskable = false) {
    const padding = isMaskable ? size * 0.1 : 0;
    const contentSize = size - padding * 2;

    return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#3b82f6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad)" rx="${isMaskable ? size * 0.2 : 0}"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${contentSize * 0.6}" font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="central">F</text>
</svg>`;
}

async function generateIcons() {
    console.log('🎨 Generando iconos PWA...\n');

    // Generar iconos normales
    for (const size of sizes) {
        const svg = createIconSVG(size, false);
        const outputPath = path.join(iconsDir, `icon-${size}x${size}.png`);

        try {
            await sharp(Buffer.from(svg))
                .resize(size, size)
                .png()
                .toFile(outputPath);
            console.log(`✅ Generado: icon-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Error generando icon-${size}x${size}.png:`, error.message);
        }
    }

    // Generar iconos maskable
    for (const size of maskableSizes) {
        const svg = createIconSVG(size, true);
        const outputPath = path.join(iconsDir, `icon-maskable-${size}x${size}.png`);

        try {
            await sharp(Buffer.from(svg))
                .resize(size, size)
                .png()
                .toFile(outputPath);
            console.log(`✅ Generado: icon-maskable-${size}x${size}.png`);
        } catch (error) {
            console.error(`❌ Error generando icon-maskable-${size}x${size}.png:`, error.message);
        }
    }

    console.log('\n✨ ¡Iconos generados exitosamente!');
    console.log(`📁 Ubicación: ${iconsDir}`);
}

// Ejecutar
generateIcons().catch(console.error);

