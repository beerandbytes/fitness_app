# Generador de Iconos PWA

Los iconos faltantes se pueden generar usando herramientas online o scripts.

## Solución Rápida: Usar un icono existente como placeholder

Por ahora, puedes copiar un icono existente o crear uno básico.

## Solución Completa: Generar todos los iconos

### Opción 1: Usar PWA Builder Image Generator
1. Ve a: https://www.pwabuilder.com/imageGenerator
2. Sube una imagen de 512x512px o más
3. Descarga todos los tamaños generados
4. Colócalos en `public/icons/`

### Opción 2: Usar RealFaviconGenerator
1. Ve a: https://realfavicongenerator.net/
2. Sube tu logo/imagen
3. Configura los tamaños necesarios
4. Descarga y coloca en `public/icons/`

### Opción 3: Crear manualmente con ImageMagick
```bash
# Si tienes ImageMagick instalado
convert base-icon.png -resize 72x72 icons/icon-72x72.png
convert base-icon.png -resize 96x96 icons/icon-96x96.png
convert base-icon.png -resize 128x128 icons/icon-128x128.png
convert base-icon.png -resize 144x144 icons/icon-144x144.png
convert base-icon.png -resize 152x152 icons/icon-152x152.png
convert base-icon.png -resize 192x192 icons/icon-192x192.png
convert base-icon.png -resize 384x384 icons/icon-384x384.png
convert base-icon.png -resize 512x512 icons/icon-512x512.png
```

## Tamaños Requeridos
- 72x72.png
- 96x96.png
- 128x128.png
- 144x144.png (Windows)
- 152x152.png (iOS)
- 192x192.png (Android - requerido)
- 384x384.png (Android)
- 512x512.png (Android - requerido)
- icon-maskable-192x192.png (Android maskable)
- icon-maskable-512x512.png (Android maskable)

