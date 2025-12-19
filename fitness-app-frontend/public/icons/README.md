# Iconos PWA

Este directorio contiene los iconos necesarios para la Progressive Web App (PWA).

## ⚠️ Iconos Faltantes

Actualmente los iconos no están generados. Esto causa errores 404 en la consola del navegador.

## 🚀 Soluciones Rápidas

### Opción 1: Generador HTML (Más Fácil - Sin Instalación)

1. Abre el archivo `create-placeholder-icons.html` en tu navegador
2. Haz clic en "Generar Todos los Iconos"
3. Haz clic en "Descargar Todos"
4. Guarda todos los archivos descargados en esta carpeta (`public/icons/`)

### Opción 2: Script Node.js (Requiere sharp)

```bash
# Instalar sharp
npm install sharp

# Generar iconos
npm run generate-icons
```

### Opción 3: Herramientas Online

1. **PWA Builder Image Generator**: https://www.pwabuilder.com/imageGenerator
   - Sube una imagen de 512x512px o más
   - Descarga todos los tamaños generados
   - Colócalos en esta carpeta

2. **RealFaviconGenerator**: https://realfavicongenerator.net/
   - Sube tu logo/imagen
   - Configura los tamaños necesarios
   - Descarga y coloca en esta carpeta

## 📋 Tamaños Requeridos

- `icon-72x72.png` - Android
- `icon-96x96.png` - Android
- `icon-128x128.png` - Android
- `icon-144x144.png` - Windows (⚠️ Este es el que está causando el error 404)
- `icon-152x152.png` - iOS
- `icon-192x192.png` - Android (requerido)
- `icon-384x384.png` - Android
- `icon-512x512.png` - Android (requerido)
- `icon-maskable-192x192.png` - Android maskable
- `icon-maskable-512x512.png` - Android maskable

## 🎨 Diseño Sugerido

- **Color primario**: #D45A0F (naranja)
- **Color secundario**: #FF6D1F (naranja claro)
- **Fondo**: Gradiente naranja
- **Icono**: Puede ser una "F" estilizada, un logo de fitness, o un ícono de pesas

## ✅ Verificación

Una vez que los iconos estén creados, el error 404 desaparecerá y la PWA estará completamente funcional.
